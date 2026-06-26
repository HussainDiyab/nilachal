import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * FluidText — renders one or more lines of text into a WebGL texture and
 * applies a fluid ripple/displacement that follows the pointer ON HOVER.
 * When not hovered the text is completely stable. Self-contained (raw WebGL,
 * no deps).
 *
 * Note: because the text becomes a GPU texture, it is no longer live DOM
 * text — an accessible visually-hidden copy is rendered for screen readers.
 *
 * Revert: replace <FluidText .../> in the hero with the previous
 * <NilachalWave /> and delete this file.
 */

export type FluidLine = {
  text: string;
  scale: number;
  /** font weight (only applies to multi-weight families like "Archivo") */
  weight?: number;
  /** font family name without quotes; defaults to "Archivo Black" */
  family?: string;
};

const VERT = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uTime;
uniform float uHover;

void main() {
  vec2 uv = vUv;

  // pointer-driven ripple, decaying with distance — only present on hover
  float dist = distance(vUv, uMouse);
  float ripple = sin(dist * 30.0 - uTime * 4.0) * 0.018;
  float falloff = smoothstep(0.42, 0.0, dist);
  vec2 dir = normalize(vUv - uMouse + 0.0001);
  vec2 disp = uv + dir * ripple * falloff * uHover;

  // gentle flow, also gated by hover so the word is perfectly stable at rest
  disp.x += sin(uv.y * 11.0 + uTime * 1.1) * 0.0035 * uHover;
  disp.y += cos(uv.x * 11.0 + uTime * 0.9) * 0.0035 * uHover;

  gl_FragColor = texture2D(uTexture, disp);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function baseFontSize(w: number) {
  if (w >= 1024) return 150;
  if (w >= 640) return 110;
  return 64;
}

export function FluidText({ lines, className = "" }: { lines: FluidLine[]; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // When WebGL is unavailable or its context is lost, show a plain styled
  // headline instead of the (now-blank) canvas. Bumped to re-init on restore.
  const [failed, setFailed] = useState(false);
  const [glVersion, setGlVersion] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const onContextLost = (e: Event) => {
      e.preventDefault(); // required for 'webglcontextrestored' to ever fire
      cancelAnimationFrame(raf);
      setFailed(true);
    };
    const onContextRestored = () => {
      setFailed(false);
      setGlVersion((v) => v + 1);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    const removeContextListeners = () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
    const giveUp = () => {
      removeContextListeners();
      setFailed(true);
    };

    const gl =
      (canvas.getContext("webgl", {
        premultipliedAlpha: true,
        alpha: true,
      }) as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) {
      giveUp();
      return;
    }

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) {
      giveUp();
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      giveUp();
      return;
    }
    gl.useProgram(program);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTexture = gl.getUniformLocation(program, "uTexture");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uHover = gl.getUniformLocation(program, "uHover");

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const textCanvas = document.createElement("canvas");
    const tctx = textCanvas.getContext("2d")!;
    let lastWidth = 0;

    const setFont = (fs: number, weight = 900, family = "Archivo Black") => {
      tctx.font = `${weight} ${fs}px "${family}", sans-serif`;
    };

    const buildTexture = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      lastWidth = window.innerWidth;
      const maxWidth = Math.min(window.innerWidth * 0.9, 1400);
      const base = baseFontSize(window.innerWidth);

      // measure each line at its own size, shrinking everything if a line overflows
      let factor = 1;
      let measured: { text: string; fs: number; width: number }[] = [];
      const measure = () =>
        lines.map((l) => {
          const fs = base * l.scale * factor;
          setFont(fs, l.weight, l.family);
          return { text: l.text, fs, width: tctx.measureText(l.text).width };
        });
      measured = measure();
      let guard = 0;
      while (guard++ < 24 && measured.some((m) => m.width > maxWidth)) {
        factor *= 0.92;
        measured = measure();
      }

      const maxLineW = Math.max(...measured.map((m) => m.width));
      const lineGap = base * factor * 0.08;
      const heights = measured.map((m) => m.fs * 1.06);
      const totalH = heights.reduce((a, b) => a + b, 0) + lineGap * (lines.length - 1);
      const padX = base * factor * 0.3;
      const padY = base * factor * 0.25;
      const cssW = Math.ceil(maxLineW + padX * 2);
      const cssH = Math.ceil(totalH + padY * 2);

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);

      textCanvas.width = canvas.width;
      textCanvas.height = canvas.height;
      tctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      tctx.scale(dpr, dpr);
      tctx.fillStyle = "#ffffff";
      tctx.textAlign = "center";
      tctx.textBaseline = "middle";

      let y = (cssH - totalH) / 2;
      measured.forEach((m, i) => {
        const h = heights[i];
        setFont(m.fs, lines[i].weight, lines[i].family);
        tctx.fillText(m.text, cssW / 2, y + h / 2);
        y += h + lineGap;
      });
      tctx.setTransform(1, 0, 0, 1, 0, 0);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    };

    let destroyed = false;
    const init = async () => {
      try {
        await (document as Document).fonts.load(`900 150px "Archivo Black"`);
        await (document as Document).fonts.load(`500 80px "Archivo"`);
        await (document as Document).fonts.ready;
      } catch {
        /* fonts API unavailable — proceed with fallback metrics */
      }
      if (destroyed) return;
      buildTexture();
    };
    init();

    // pointer tracking
    let targetX = 0.5;
    let targetY = 0.5;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetHover = 0;
    let hover = 0;

    // Reduced motion: skip pointer-driven ripple — hover stays 0 so the loop
    // renders the text completely static (ambient & ripple are gated by hover).
    const reduced = prefersReducedMotion();

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width;
      targetY = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    const onEnter = () => (targetHover = 1);
    const onLeave = () => (targetHover = 0);
    if (!reduced) {
      container.addEventListener("pointermove", onMove);
      container.addEventListener("pointerenter", onEnter);
      container.addEventListener("pointerleave", onLeave);
    }

    const onResize = () => {
      if (window.innerWidth !== lastWidth) buildTexture();
    };
    window.addEventListener("resize", onResize);

    const start = performance.now();
    let raf = 0;
    const render = () => {
      const time = (performance.now() - start) / 1000;
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;
      hover += (targetHover - hover) * 0.08;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTexture, 0);
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uHover, hover);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      removeContextListeners();
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
    };
  }, [lines, glVersion]);

  return (
    <div ref={containerRef} className={`inline-flex justify-center ${className}`}>
      {failed ? (
        // Visible fallback when WebGL is unavailable / its context was lost.
        <div className="flex flex-col items-center leading-[0.95]">
          {lines.map((l, i) => (
            <span
              key={i}
              style={{
                fontFamily: `"${l.family ?? "Archivo Black"}", sans-serif`,
                fontWeight: l.weight ?? 900,
                fontSize: `clamp(2.25rem, ${l.scale * 11}vw, ${l.scale * 9.5}rem)`,
                color: "#fff",
              }}
            >
              {l.text}
            </span>
          ))}
        </div>
      ) : (
        <span className="sr-only">{lines.map((l) => l.text).join(" ")}</span>
      )}
      <canvas ref={canvasRef} aria-hidden="true" className={`block ${failed ? "hidden" : ""}`} />
    </div>
  );
}

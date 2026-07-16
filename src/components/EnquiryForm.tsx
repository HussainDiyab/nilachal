import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";

/*
 * Enquiry form — submits to Web3Forms (no backend needed on Vercel).
 *
 * SETUP: paste your Web3Forms access key below. Get one for free in ~2 min at
 * https://web3forms.com — enter your email, and the key is emailed to you.
 * Submissions then arrive at whatever inbox that email address is.
 */
const WEB3FORMS_ACCESS_KEY = "8febb781-5b5f-4156-bf72-bda2f1445c02";

const INTEREST_OPTIONS = ["Real Estate", "Trading", "Hospitality", "Agriculture"] as const;

type Status = "idle" | "submitting" | "success" | "error";

const labelClass = "text-[11px] uppercase tracking-[0.22em] text-muted-foreground";
const fieldClass =
  "mt-3 w-full bg-transparent border-b border-border focus:border-primary text-primary text-lg sm:text-xl py-2 outline-none transition-colors placeholder:text-muted-foreground/50";

export function EnquiryForm({ whatsappUrl }: { whatsappUrl: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const data = new FormData(form);

    // Guard: required fields (native `required` handles the UI, this is a backstop).
    const name = (data.get("name") as string)?.trim();
    const phone = (data.get("phone") as string)?.trim();
    if (!name || !phone) {
      setError("Please add your name and phone number.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setError("");

    data.append("access_key", WEB3FORMS_ACCESS_KEY);
    data.append("subject", `New enquiry from ${name} — Nilachal website`);
    data.append("from_name", "Nilachal Website");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        form.reset();
      } else {
        setError(json.message || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border-t border-primary pt-8">
        <div className={labelClass}>Message sent</div>
        <p className="mt-4 text-2xl sm:text-3xl text-primary font-light leading-snug">
          Thank you — we've received your enquiry and will be{" "}
          <span className="font-serif-italic">in touch shortly</span>.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-muted-foreground hover:text-primary transition-colors"
        >
          Send another enquiry
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Honeypot — hidden from users, catches bots. */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <label htmlFor="ef-name" className={labelClass}>
            Name
          </label>
          <input
            id="ef-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="ef-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="ef-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+91"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="ef-interest" className={labelClass}>
          Interest
        </label>
        <select
          id="ef-interest"
          name="interest"
          defaultValue=""
          className={`${fieldClass} cursor-pointer`}
        >
          <option value="" disabled>
            Select an option
          </option>
          {INTEREST_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ef-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="ef-message"
          name="message"
          rows={3}
          placeholder="Tell us a little about what you're looking for"
          className={`${fieldClass} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive">
          {error}{" "}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Or message us on WhatsApp instead.
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] bg-primary text-primary-foreground px-7 py-3.5 hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending…" : "Send enquiry"}
        {!submitting && (
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        )}
      </button>
    </form>
  );
}

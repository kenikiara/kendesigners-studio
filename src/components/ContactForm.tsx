"use client";

import { useState } from "react";
import { site } from "@/lib/site";

const serviceOptions = [
  "Web Design",
  "Online Store",
  "SEO",
  "Custom Software",
  "AI Integration",
  "Branding",
];

// No backend: submits as a pre-filled WhatsApp message that also records the
// page the client browsed in from (the referrer), so Ken has context.
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", service: serviceOptions[0], message: "" });

  const submit = () => {
    const source =
      typeof document !== "undefined" && document.referrer
        ? document.referrer
        : typeof window !== "undefined"
          ? window.location.href
          : site.url;
    const text = encodeURIComponent(
      `Hi Ken Designers. I am ${form.name || "..."} (${form.email || "no email"}). Interested in: ${form.service}. ${form.message} (Enquiry from: ${source})`
    );
    window.open(`${site.whatsapp}?text=${text}`, "_blank", "noopener");
  };

  const field =
    "w-full rounded-2xl bg-panel border border-white/10 px-5 py-3.5 text-white placeholder:text-white/30 focus:border-blue focus:outline-none text-sm font-medium";

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div>
        <label htmlFor="name" className="text-xs font-bold text-white/70 block mb-2">
          Full name *
        </label>
        <input
          id="name"
          className={field}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="text-xs font-bold text-white/70 block mb-2">
          Email *
        </label>
        <input
          id="email"
          type="email"
          className={field}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <fieldset>
        <legend className="text-xs font-bold text-white/70 mb-3">
          What service are you interested in?
        </legend>
        <div className="space-y-2.5">
          {serviceOptions.map((s) => (
            <label key={s} className="flex items-center gap-3 cursor-pointer text-sm font-semibold">
              <input
                type="radio"
                name="service"
                value={s}
                checked={form.service === s}
                onChange={() => setForm({ ...form, service: s })}
                className="w-4 h-4 accent-[#006fff]"
              />
              <span className={form.service === s ? "text-white" : "text-white/60"}>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="message" className="text-xs font-bold text-white/70 block mb-2">
          Tell us about the project
        </label>
        <textarea
          id="message"
          className={`${field} min-h-28`}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      <button
        type="submit"
        className="w-full py-4 rounded-full bg-blue font-extrabold text-sm hover:bg-violet transition-colors"
      >
        Send via WhatsApp
      </button>
      <p className="text-xs text-white/40 font-medium text-center">
        Or call {site.phoneDisplay} · {site.email}
      </p>
    </form>
  );
}

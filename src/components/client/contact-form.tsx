"use client";

import { useActionState } from "react";
import { saveClientContact, type ClientExperienceState } from "@/lib/actions/client-experience";

type Details = {
  phone: string;
  city: string;
  address: string;
  preferred_contact_method: string;
} | null;

const emptyState: ClientExperienceState = { error: "", message: "" };

export function ClientContactForm({ initial }: { initial: Details }) {
  const [state, action, pending] = useActionState(saveClientContact, emptyState);
  return <form className="client-panel client-contact-form" action={action}>
    <div className="client-form-grid">
      <label>Phone number<input name="phone" type="tel" maxLength={20} defaultValue={initial?.phone || ""} placeholder="+91 98765 43210" autoComplete="tel" /></label>
      <label>City<input name="city" maxLength={80} defaultValue={initial?.city || ""} autoComplete="address-level2" /></label>
      <label className="client-form-wide">Address (optional)<textarea name="address" rows={3} maxLength={350} defaultValue={initial?.address || ""} autoComplete="street-address" /></label>
      <label>Preferred contact method<select name="preferred_contact_method" defaultValue={initial?.preferred_contact_method || "email"}>
        <option value="email">Email</option><option value="phone">Phone call</option><option value="whatsapp">WhatsApp</option>
      </select></label>
    </div>
    <p className="cms-hint">This is a contact preference only. It does not enable WhatsApp messaging or change your notification consent. Those settings are managed separately.</p>
    <div className="client-form-actions"><button type="submit" disabled={pending} className="btn btn-primary">{pending ? "Saving…" : "Save details"}</button>
      {(state.error || state.message) && <p className={state.error ? "cms-error" : "cms-success"} role="status" aria-live="polite">{state.error || state.message}</p>}
    </div>
  </form>;
}

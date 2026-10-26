"use client";
import { useActionState } from "react";
import { ArrowUpRight } from "lucide-react";
import { sendInquiry } from "@/lib/actions/inquiry";
const initialState = { message: "", error: "" };
export function ContactForm() {
  const [state, action, pending] = useActionState(sendInquiry, initialState);
  return <form action={action} className="form-grid">
    <div className="form-field"><label htmlFor="name">Full name *</label><input id="name" name="name" type="text" minLength={2} maxLength={120} required autoComplete="name" placeholder="Your name"/></div>
    <div className="form-field"><label htmlFor="email">Email address *</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com"/></div>
    <div className="form-field span-2"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Optional"/></div>
    <div className="form-field span-2"><label htmlFor="message">Tell us about your space *</label><textarea id="message" name="message" required minLength={15} maxLength={3000} placeholder="Your project, rough timeline, or simply what's on your mind..."/></div>
    <div style={{position:"absolute",left:"-10000px"}} aria-hidden="true"><label htmlFor="website">Website</label><input name="website" id="website" tabIndex={-1} autoComplete="off"/></div>
    <div className="form-field span-2"><button disabled={pending} type="submit" className="btn btn-primary" style={{justifySelf:"start"}}>{pending ? "Sending..." : "Send enquiry"}<ArrowUpRight size={17}/></button>
      <div aria-live="polite" className="form-status">{state.error && <p className="form-error">{state.error}</p>}{state.message && <p className="form-success">{state.message}</p>}</div>
    </div>
  </form>;
}

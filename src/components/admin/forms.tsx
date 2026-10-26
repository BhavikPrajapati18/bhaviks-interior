"use client";

import { useActionState } from "react";
import { addClientAccount, saveLead, saveQuote, saveClientProject, uploadClientDocument, type AdminFormState } from "@/lib/actions/admin";

export type ClientOption = { user_id: string; full_name: string; email: string };
export type LeadOption = { id: string; full_name: string; email: string; assigned_client_id: string | null };
const initialState: AdminFormState = { error: "", message: "" };
const caption = (text: string) => <span>{text}</span>;

function Notice({ state }: { state: AdminFormState }) {
  return <p role="status" aria-live="polite" className={state.error ? "cms-error" : "cms-success"}>{state.error || state.message}</p>;
}
export function ClientAccountForm() {
  const [state, action, pending] = useActionState(addClientAccount, initialState);
  return <form className="cms-surface ops-form" action={action}>
    <h2>Link an existing Auth user</h2>
    <p className="cms-hint">First create the client's email/password in Supabase → Authentication → Users. Copy the new User UID here. Don't use your own admin UID.</p>
    <div className="cms-fields">
      <label className="cms-field">{caption("Auth User UID")}<input name="user_id" required placeholder="UUID from Authentication → Users"/></label>
      <label className="cms-field">{caption("Client full name")}<input name="full_name" minLength={2} maxLength={120} required/></label>
      <label className="cms-field">{caption("Client email")}<input name="email" type="email" required/></label>
    </div>
    <div className="cms-form-footer"><button disabled={pending} className="btn btn-primary">{pending ? "Linking…" : "Link client"}</button><Notice state={state}/></div>
  </form>;
}

export function LeadForm({ lead, clients }: {
  lead: { id: string; status: string; internal_notes: string; assigned_client_id: string | null };
  clients: ClientOption[];
}) {
  const [state, action, pending] = useActionState(saveLead, initialState);
  return <form className="cms-surface ops-form" action={action}>
    <input type="hidden" name="id" value={lead.id}/>
    <div className="cms-fields">
      <label className="cms-field">{caption("Status")}<select name="status" defaultValue={lead.status}>{["new","contacted","closed"].map(s=><option value={s} key={s}>{s}</option>)}</select></label>
      <label className="cms-field">{caption("Linked client (optional)")}<select name="assigned_client_id" defaultValue={lead.assigned_client_id || ""}><option value="">Unassigned</option>{clients.map(c=><option value={c.user_id} key={c.user_id}>{c.full_name} ({c.email})</option>)}</select></label>
      <label className="cms-field ops-span">{caption("Internal notes (not visible to client)")}<textarea name="internal_notes" maxLength={4000} rows={5} defaultValue={lead.internal_notes || ""}/></label>
    </div>
    <div className="cms-form-footer"><button disabled={pending} className="btn btn-primary">{pending ? "Saving…" : "Save lead"}</button><Notice state={state}/></div>
  </form>;
}

export type QuoteFields = { id?: string; client_user_id: string; inquiry_id: string | null; title: string; description: string; amount: number; valid_until: string | null; status: string };
export function QuoteForm({ initial, clients, leads }: { initial?: QuoteFields; clients: ClientOption[]; leads: LeadOption[] }) {
  const [state, action, pending] = useActionState(saveQuote, initialState);
  return <form className="cms-surface ops-form" action={action}>
    {initial?.id && <input type="hidden" name="id" value={initial.id}/>}
    <div className="cms-fields">
      <label className="cms-field">{caption("Client")}<select name="client_user_id" defaultValue={initial?.client_user_id || ""} required><option value="">Choose client</option>{clients.map(c=><option key={c.user_id} value={c.user_id}>{c.full_name} — {c.email}</option>)}</select></label>
      <label className="cms-field">{caption("Related inquiry (optional)")}<select name="inquiry_id" defaultValue={initial?.inquiry_id || ""}><option value="">None</option>{leads.map(l=><option value={l.id} key={l.id}>{l.full_name} — {l.email}</option>)}</select></label>
      <label className="cms-field">{caption("Quote title")}<input name="title" minLength={2} maxLength={160} required defaultValue={initial?.title || ""}/></label>
      <label className="cms-field">{caption("Amount (INR)")}<input name="amount" type="number" min="0" step="0.01" required defaultValue={initial?.amount ?? 0}/></label>
      <label className="cms-field">{caption("Valid until (optional)")}<input name="valid_until" type="date" defaultValue={initial?.valid_until || ""}/></label>
      <label className="cms-field">{caption("Visibility / status")}<select name="status" defaultValue={initial?.status || "draft"}>{["draft","shared","accepted","declined"].map(s=><option key={s} value={s}>{s}</option>)}</select></label>
      <label className="cms-field ops-span">{caption("Scope and inclusions")}<textarea name="description" maxLength={5000} rows={6} defaultValue={initial?.description || ""}/></label>
    </div>
    <p className="cms-hint">Draft stays internal. Shared appears in this client's portal. Sharing here does not send an email or charge a payment. Keep INR amount inclusive of whatever you specify in scope.</p>
    <div className="cms-form-footer"><button disabled={pending} className="btn btn-primary">{pending ? "Saving…" : initial?.id ? "Save quote" : "Create quote"}</button><Notice state={state}/></div>
  </form>;
}

export type ProjectFields = { id?: string; client_user_id: string; inquiry_id: string | null; title: string; description: string; phase: string; status: string; progress: number; start_date: string | null; target_date: string | null };
export function ClientProjectForm({ initial, clients, leads }: { initial?: ProjectFields; clients: ClientOption[]; leads: LeadOption[] }) {
  const [state, action, pending] = useActionState(saveClientProject, initialState);
  return <form className="cms-surface ops-form" action={action}>
    {initial?.id && <input type="hidden" name="id" value={initial.id}/>}
    <div className="cms-fields">
      <label className="cms-field">{caption("Client (fixed after creation)")}<select name="client_user_id" required defaultValue={initial?.client_user_id || ""} disabled={Boolean(initial?.id)}><option value="">Choose client</option>{clients.map(c=><option key={c.user_id} value={c.user_id}>{c.full_name} — {c.email}</option>)}</select>{initial?.id && <input name="client_user_id" type="hidden" value={initial.client_user_id}/>}</label>
      <label className="cms-field">{caption("Related inquiry (optional)")}<select name="inquiry_id" defaultValue={initial?.inquiry_id || ""}><option value="">None</option>{leads.map(l=><option key={l.id} value={l.id}>{l.full_name} — {l.email}</option>)}</select></label>
      <label className="cms-field">{caption("Project name")}<input name="title" required minLength={2} maxLength={160} defaultValue={initial?.title || ""}/></label>
      <label className="cms-field">{caption("Phase")}<input name="phase" required maxLength={100} defaultValue={initial?.phase || "Discovery"}/></label>
      <label className="cms-field">{caption("Status")}<select name="status" defaultValue={initial?.status || "planning"}>{["planning","active","on_hold","completed"].map(s=><option value={s} key={s}>{s}</option>)}</select></label>
      <label className="cms-field">{caption("Progress (0–100%)")}<input name="progress" type="number" min={0} max={100} required defaultValue={initial?.progress ?? 0}/></label>
      <label className="cms-field">{caption("Start date")}<input name="start_date" type="date" defaultValue={initial?.start_date || ""}/></label>
      <label className="cms-field">{caption("Target date")}<input name="target_date" type="date" defaultValue={initial?.target_date || ""}/></label>
      <label className="cms-field ops-span">{caption("Project overview")}<textarea name="description" rows={5} maxLength={5000} defaultValue={initial?.description || ""}/></label>
    </div>
    <div className="cms-form-footer"><button disabled={pending} className="btn btn-primary">{pending ? "Saving…" : initial?.id ? "Save project" : "Create project"}</button><Notice state={state}/></div>
  </form>;
}

export function PrivateDocumentForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(uploadClientDocument, initialState);
  return <form className="cms-surface ops-form" action={action}>
    <input type="hidden" name="project_id" value={projectId}/>
    <h2>Add private client document</h2>
    <div className="cms-fields">
      <label className="cms-field">{caption("Document title")}<input name="label" required minLength={2} maxLength={160} placeholder="e.g. Revised floor plan"/></label>
      <label className="cms-field">{caption("File (up to 10 MB)")}<input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" required/></label>
    </div>
    <p className="cms-hint">Files remain private; only admins and the assigned client can download them using temporary links.</p>
    <div className="cms-form-footer"><button disabled={pending} className="btn btn-primary">{pending ? "Uploading…" : "Upload document"}</button><Notice state={state}/></div>
  </form>;
}

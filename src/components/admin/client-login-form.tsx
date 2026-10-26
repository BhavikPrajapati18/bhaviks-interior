"use client";
import { useActionState } from "react";
import { clientSignIn } from "@/lib/actions/client";
export function ClientLoginForm() {
  const [state, action, pending] = useActionState(clientSignIn, { error: "" });
  return <form action={action} className="form-grid" style={{ maxWidth: 500 }}>
    <div className="form-field span-2"><label htmlFor="client-email">Email</label><input name="email" id="client-email" type="email" autoComplete="username" required/></div>
    <div className="form-field span-2"><label htmlFor="client-password">Password</label><input name="password" id="client-password" type="password" autoComplete="current-password" required/></div>
    <div className="form-field span-2"><button className="btn btn-primary" disabled={pending}>{pending ? "Signing in…" : "Client sign in"}</button><p className="form-error" role="alert">{state.error}</p></div>
  </form>;
}

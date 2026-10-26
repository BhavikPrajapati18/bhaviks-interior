"use client";
import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  return <form action={action} className="form-grid" style={{maxWidth:500}}>
    <div className="form-field span-2"><label htmlFor="email">Email</label><input type="email" id="email" name="email" autoComplete="username" required/></div>
    <div className="form-field span-2"><label htmlFor="password">Password</label><input type="password" id="password" name="password" autoComplete="current-password" required/></div>
    <div className="form-field span-2"><button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
      <p className="form-error" aria-live="polite">{state.error}</p>
    </div>
  </form>;
}

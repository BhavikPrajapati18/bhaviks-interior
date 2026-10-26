import Link from "next/link";
import { clientSignOut } from "@/lib/actions/client";
export default function ClientPending() {
  return <main className="studio-page"><div className="studio-shell"><div className="studio-panel">
    <span className="eyebrow kicker">CLIENT ACCESS</span><h1>Account not linked yet</h1>
    <p className="body-text">Your sign-in was successful, but your client account has not been linked to a project. Please contact the studio to request access.</p>
    <div className="cms-form-footer"><Link href="/" className="btn btn-outline">Back to website</Link><form action={clientSignOut}><button className="btn btn-primary">Sign out</button></form></div>
  </div></div></main>;
}

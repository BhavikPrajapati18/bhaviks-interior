import Link from "next/link";
import { ClientLoginForm } from "@/components/admin/client-login-form";
export default function ClientLogin() {
  return <main className="studio-page"><div className="studio-shell"><Link href="/" className="studio-back">← Return to website</Link>
    <div className="studio-panel"><span className="eyebrow kicker">PRIVATE CLIENT AREA</span><h1>Your space, your journey.</h1>
      <p className="body-text" style={{ marginBottom: 26 }}>Sign in with the email and password provided for your project. Access is available after your account has been linked by our studio.</p><ClientLoginForm/></div>
  </div></main>;
}

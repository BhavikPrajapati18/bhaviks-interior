import Link from "next/link";
import { LoginForm } from "@/components/studio/login-form";
export default function StudioLoginPage() {
  return <main className="studio-page"><div className="studio-shell"><Link href="/" className="studio-back">← Back to website</Link><div className="studio-panel">
    <span className="eyebrow kicker">CONTENT MANAGEMENT</span><h1>Studio sign in</h1><p className="body-text" style={{marginBottom:30}}>For authorised marketing and admin users. Sign in to edit the website.</p><LoginForm/>
  </div></div></main>;
}

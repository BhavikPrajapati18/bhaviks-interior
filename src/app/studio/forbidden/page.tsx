import Link from "next/link";
export default function ForbiddenPage() {
  return <main className="studio-page"><div className="studio-shell"><div className="studio-panel"><h1>Access not available</h1><p className="body-text">Your account does not have the marketing or admin role. Ask the project owner to assign a role in the new Supabase project.</p><Link href="/studio/login" className="btn btn-primary" style={{marginTop:25}}>Back to sign in</Link></div></div></main>;
}

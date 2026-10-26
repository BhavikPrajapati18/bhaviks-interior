import Link from "next/link";
export default function NotFound() {
  return <main className="studio-page"><div className="studio-shell"><div className="studio-panel"><span className="eyebrow kicker">404 / PAGE NOT FOUND</span><h1 style={{marginTop:24}}>That space doesn&apos;t exist yet.</h1><p className="body-text">The page may have moved, or the content is not published.</p><Link href="/" className="btn btn-primary" style={{marginTop:28}}>Back to homepage</Link></div></div></main>;
}

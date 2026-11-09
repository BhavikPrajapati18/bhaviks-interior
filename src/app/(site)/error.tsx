"use client";

import Link from "next/link";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="page-state"><div className="page-state-inner">
    <span className="page-state-kicker">TEMPORARILY UNAVAILABLE</span>
    <h1>We couldn&apos;t load this page.</h1>
    <p>There was a problem displaying this content. Please try again or return to the homepage.</p>
    <div className="page-state-actions"><button type="button" className="btn btn-primary" onClick={reset}>Try again</button><Link className="btn btn-outline" href="/">Back to home</Link></div>
  </div></div>;
}

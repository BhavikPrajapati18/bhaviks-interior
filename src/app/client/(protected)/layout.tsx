import Link from "next/link";
import { requireClient } from "@/lib/access";
import { clientSignOut } from "@/lib/actions/client";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { account } = await requireClient();
  return <div className="client-shell">
    <header className="client-topbar">
      <Link className="client-wordmark" href="/client">BHAVIK&apos;S INTERIOR<span>CLIENT PORTAL</span></Link>
      <nav className="client-desktop-nav" aria-label="Client navigation">
        <Link href="/client">Overview</Link><Link href="/client/quotes">Quotations</Link><Link href="/client/projects">Projects</Link>
        <Link href="/client/notifications">Notifications</Link><Link href="/client/profile">Profile</Link><Link href="/client/settings">Settings</Link>
        <form action={clientSignOut}><button type="submit">Sign out</button></form>
      </nav>
      <details className="client-mobile-menu"><summary>Menu <span aria-hidden="true">＋</span></summary>
        <nav aria-label="Mobile client navigation">
          <Link href="/client">Overview</Link><Link href="/client/quotes">Quotations</Link><Link href="/client/projects">Projects</Link>
          <Link href="/client/notifications">Notifications</Link><Link href="/client/profile">Profile</Link><Link href="/client/settings">Settings</Link>
          <form action={clientSignOut}><button type="submit">Sign out</button></form>
        </nav>
      </details>
    </header>
    <main className="client-content"><div className="client-greeting">PRIVATE SPACE / {account.full_name.toUpperCase()}</div>{children}</main>
  </div>;
}

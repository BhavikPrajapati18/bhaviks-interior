import Link from "next/link";
import { requireClient } from "@/lib/access";
import { clientSignOut } from "@/lib/actions/client";
export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { account } = await requireClient();
  return <div className="client-shell"><header className="client-topbar"><Link className="client-wordmark" href="/client">BHAVIK'S INTERIOR<span>CLIENT PORTAL</span></Link>
      <nav><Link href="/client">Overview</Link><Link href="/client/quotes">Quotations</Link><Link href="/client/projects">Projects</Link><form action={clientSignOut}><button>Sign out</button></form></nav>
    </header><main className="client-content"><div className="client-greeting">PRIVATE SPACE / {account.full_name.toUpperCase()}</div>{children}</main></div>;
}

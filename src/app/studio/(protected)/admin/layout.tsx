import Link from "next/link";
import { requireAdmin } from "@/lib/access";

const links = [
  ["/studio/admin", "Dashboard"],
  ["/studio/admin/leads", "Leads"],
  ["/studio/admin/clients", "Clients"],
  ["/studio/admin/quotes", "Quotations"],
  ["/studio/admin/projects", "Client projects"]
];
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div>
    <div className="ops-header"><span>OPERATIONS / ADMIN ONLY</span><nav aria-label="Admin sections">{links.map(([url, title])=><Link href={url} key={url}>{title}</Link>)}</nav></div>
    {children}
  </div>;
}

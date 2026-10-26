import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { CmsHeading } from "@/components/studio/ui";

export default async function AdminOverview() {
  const { supabase } = await requireAdmin();
  const [leads, clients, quotes, projects] = await Promise.all([
    supabase.from("inquiries").select("id", { head: true, count: "exact" }),
    supabase.from("client_accounts").select("user_id", { head: true, count: "exact" }),
    supabase.from("client_quotes").select("id", { head: true, count: "exact" }),
    supabase.from("client_projects").select("id", { head: true, count: "exact" })
  ]);
  if ([leads,clients,quotes,projects].some(result => result.error)) throw new Error("Admin data unavailable. Check migration 003.");
  const cards = [
    { name:"Leads", count: leads.count, href:"/studio/admin/leads", info:"Incoming website enquiries" },
    { name:"Clients", count: clients.count, href:"/studio/admin/clients", info:"Accounts linked to Auth users" },
    { name:"Quotes", count: quotes.count, href:"/studio/admin/quotes", info:"Draft and shared quotations" },
    { name:"Client projects", count: projects.count, href:"/studio/admin/projects", info:"Progress, phases and documents" }
  ];
  return <><CmsHeading title="Operations dashboard" description="Manage enquiries, clients, quotations and project delivery."/>
    <div className="cms-metrics">{cards.map(card => <Link className="cms-metric" key={card.href} href={card.href}><span>{card.name}</span><strong>{card.count ?? "—"}</strong><small>{card.info} ↗</small></Link>)}</div>
    <div className="cms-surface"><h2>How client access works</h2><p className="body-text">Create an Auth user in your new Supabase project, link their UID in Clients, and then assign their quotations or projects. Only that account can see the linked information in the client portal.</p></div>
  </>;
}

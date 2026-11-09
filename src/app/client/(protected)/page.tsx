import Link from "next/link";
import { requireClient } from "@/lib/access";
import { price } from "@/lib/admin-data";

const statusLabel: Record<string,string> = {
  draft: "Draft", shared: "Awaiting response", accepted: "Accepted", declined: "Declined",
  planning: "Planning", active: "In progress", on_hold: "On hold", completed: "Completed",
};

export default async function ClientDashboard() {
  const { supabase, user, account } = await requireClient();
  const [quotes, projects, contact] = await Promise.all([
    supabase.from("client_quotes").select("id,title,amount,status").order("created_at", { ascending: false }).limit(5),
    supabase.from("client_projects").select("id,title,phase,progress,status").order("created_at", { ascending: false }).limit(5),
    supabase.from("client_contact_details").select("phone,city").eq("user_id", user.id).maybeSingle(),
  ]);
  if (quotes.error || projects.error || contact.error) throw new Error("Unable to load dashboard. Check migration 009.");
  const needsProfile = !contact.data?.phone || !contact.data?.city;
  const firstName = account.full_name.split(" ")[0] || "there";
  const awaiting = (quotes.data || []).filter(q => q.status === "shared").length;
  const active = (projects.data || []).filter(p => p.status === "active").length;
  return <>
    <h1 className="client-title">Welcome, {firstName}.</h1>
    <p className="client-lede">Your projects, quotations and design updates in one private space.</p>
    {needsProfile && <div className="client-onboarding" role="note">
      <div><strong>Complete your contact profile</strong><p>Confirm your phone and city so the studio can coordinate project updates with you.</p></div>
      <Link href="/client/profile" className="btn btn-primary">Update profile ↗</Link>
    </div>}
    <div className="client-summary-grid">
      <div className="client-summary"><span>Awaiting your decision</span><strong>{awaiting}</strong><Link href="/client/quotes">View quotations ↗</Link></div>
      <div className="client-summary"><span>Active projects</span><strong>{active}</strong><Link href="/client/projects">View projects ↗</Link></div>
    </div>
    <div className="client-columns">
      <section className="client-panel"><div className="client-panel-top"><h2>Recent quotations</h2><Link href="/client/quotes">View all ↗</Link></div>
        {quotes.data?.length ? quotes.data.map(q => <Link className="client-row" key={q.id} href={`/client/quotes/${q.id}`}><span><strong>{q.title}</strong><small>{statusLabel[q.status] || q.status}</small></span><b>{price(q.amount)}</b></Link>) : <p className="client-empty">No shared quotations yet.</p>}
      </section>
      <section className="client-panel"><div className="client-panel-top"><h2>Your projects</h2><Link href="/client/projects">View all ↗</Link></div>
        {projects.data?.length ? projects.data.map(p => <Link className="client-row" key={p.id} href={`/client/projects/${p.id}`}><span><strong>{p.title}</strong><small>{p.phase} / {statusLabel[p.status] || p.status}</small></span><b>{p.progress}%</b></Link>) : <p className="client-empty">Your projects will appear here once added.</p>}
      </section>
    </div>
  </>;
}

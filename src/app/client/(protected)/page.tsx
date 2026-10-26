import Link from "next/link";
import { requireClient } from "@/lib/access";
import { price } from "@/lib/admin-data";
export default async function ClientDashboard() {
  const { supabase, account } = await requireClient();
  const [quotes, projects] = await Promise.all([
    supabase.from("client_quotes").select("id,title,amount,status").order("created_at", { ascending:false }).limit(5),
    supabase.from("client_projects").select("id,title,phase,progress,status").order("created_at", { ascending:false }).limit(5)
  ]);
  if (quotes.error || projects.error) throw new Error("Unable to load your client dashboard.");
  return <><h1 className="client-title">Welcome, {account.full_name.split(" ")[0]}.</h1>
    <p className="client-lede">Your design journey, project progress and shared documents in one place.</p>
    <div className="client-columns"><section className="client-panel"><div className="client-panel-top"><h2>Quotations</h2><Link href="/client/quotes">View all ↗</Link></div>
      {quotes.data?.length ? quotes.data.map(q=><Link className="client-row" key={q.id} href={`/client/quotes/${q.id}`}><span><strong>{q.title}</strong><small>{q.status}</small></span><b>{price(q.amount)}</b></Link>) : <p className="client-empty">No shared quotations yet.</p>}
    </section><section className="client-panel"><div className="client-panel-top"><h2>Projects</h2><Link href="/client/projects">View all ↗</Link></div>
      {projects.data?.length ? projects.data.map(p=><Link className="client-row" key={p.id} href={`/client/projects/${p.id}`}><span><strong>{p.title}</strong><small>{p.phase} / {p.status}</small></span><b>{p.progress}%</b></Link>) : <p className="client-empty">Your projects will appear here once added.</p>}
    </section></div>
  </>;
}

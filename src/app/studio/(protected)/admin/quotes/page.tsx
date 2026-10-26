import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { price, humanDate } from "@/lib/admin-data";
import { CmsHeading } from "@/components/studio/ui";

export default async function QuotesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("client_quotes")
    .select("id,title,client_user_id,amount,status,valid_until,created_at").order("created_at", { ascending:false }).limit(250);
  if (error) throw new Error(error.message);
  return <><CmsHeading title="Quotations" description="Draft and publish estimates to individual client portals." action={<Link className="btn btn-primary" href="/studio/admin/quotes/new">New quotation +</Link>}/>
    <div className="cms-surface"><div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>Quote</th><th>Amount</th><th>Status</th><th>Valid until</th><th></th></tr></thead><tbody>{data?.map(q=><tr key={q.id}><td>{q.title}</td><td>{price(q.amount)}</td><td><span className="ops-pill">{q.status}</span></td><td>{humanDate(q.valid_until)}</td><td><Link href={`/studio/admin/quotes/${q.id}`}>Edit ↗</Link></td></tr>)}</tbody></table></div>{!data?.length && <p className="cms-empty">No quotations yet.</p>}</div>
  </>;
}

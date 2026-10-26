import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { CmsHeading } from "@/components/studio/ui";
import { humanDate } from "@/lib/admin-data";

export default async function LeadsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("inquiries")
    .select("id,full_name,email,status,created_at").order("created_at", { ascending:false }).limit(250);
  if (error) throw new Error(error.message);
  return <><CmsHeading title="Leads" description="Incoming enquiries from the public contact form. Latest 250 records."/>
    <div className="cms-surface"><div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Received</th><th></th></tr></thead>
      <tbody>{data?.map(l=><tr key={l.id}><td>{l.full_name}</td><td>{l.email}</td><td><span className="ops-pill">{l.status}</span></td><td>{humanDate(l.created_at)}</td><td><Link href={`/studio/admin/leads/${l.id}`}>Open ↗</Link></td></tr>)}</tbody></table></div>
      {!data?.length && <p className="cms-empty">No enquiries yet. Submit the contact form to test.</p>}
    </div></>;
}

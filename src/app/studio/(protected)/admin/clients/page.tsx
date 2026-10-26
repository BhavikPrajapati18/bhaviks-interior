import { requireAdmin } from "@/lib/access";
import { CmsHeading } from "@/components/studio/ui";
import { ClientAccountForm } from "@/components/admin/forms";

export default async function ClientsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("client_accounts").select("user_id,full_name,email,created_at").order("created_at", { ascending:false }).limit(250);
  if (error) throw new Error(error.message);
  return <><CmsHeading title="Client accounts" description="Link clients to newly created Supabase Authentication users."/>
    <ClientAccountForm/>
    <div className="cms-surface"><h2>Linked clients</h2><div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>Name</th><th>Email</th><th>User UID</th></tr></thead><tbody>{data?.map(c=><tr key={c.user_id}><td>{c.full_name}</td><td>{c.email}</td><td className="ops-mono">{c.user_id}</td></tr>)}</tbody></table></div>
    {!data?.length && <p className="cms-empty">No client accounts linked yet.</p>}</div>
  </>;
}

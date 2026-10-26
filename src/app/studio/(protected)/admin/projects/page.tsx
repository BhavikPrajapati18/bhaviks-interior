import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { CmsHeading } from "@/components/studio/ui";
export default async function ClientProjectsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("client_projects").select("id,title,phase,status,progress").order("created_at", { ascending:false }).limit(250);
  if (error) throw new Error(error.message);
  return <><CmsHeading title="Client projects" description="Delivery work, separate from public portfolio projects." action={<Link href="/studio/admin/projects/new" className="btn btn-primary">New project +</Link>}/>
    <div className="cms-surface"><div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>Project</th><th>Phase</th><th>Status</th><th>Progress</th><th></th></tr></thead><tbody>{data?.map(p=><tr key={p.id}><td>{p.title}</td><td>{p.phase}</td><td><span className="ops-pill">{p.status}</span></td><td>{p.progress}%</td><td><Link href={`/studio/admin/projects/${p.id}`}>Manage ↗</Link></td></tr>)}</tbody></table></div>{!data?.length && <p className="cms-empty">No client projects yet.</p>}</div>
  </>;
}

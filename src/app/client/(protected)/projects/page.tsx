import Link from "next/link";
import { requireClient } from "@/lib/access";
export default async function ClientProjects() {
  const { supabase } = await requireClient();
  const { data, error } = await supabase.from("client_projects").select("id,title,phase,status,progress").order("created_at", { ascending:false });
  if (error) throw new Error("Unable to load projects.");
  return <><h1 className="client-title">Your projects</h1><p className="client-lede">Progress and important documents for your ongoing work.</p>
    <div className="client-panel">{data?.length ? data.map(p=><Link href={`/client/projects/${p.id}`} className="client-row" key={p.id}><span><strong>{p.title}</strong><small>{p.phase} · {p.status}</small></span><b>{p.progress}% ↗</b></Link>) : <p className="client-empty">No projects are linked to your account yet.</p>}</div>
  </>;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/access";
import { humanDate } from "@/lib/admin-data";
export default async function ClientProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireClient();
  const [projectResult, docsResult] = await Promise.all([
    supabase.from("client_projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("client_documents").select("id,label,storage_path,created_at").eq("project_id", id).order("created_at", { ascending:false })
  ]);
  const project = projectResult.data;
  if (projectResult.error || !project) notFound();
  if (docsResult.error) throw new Error("Unable to load project documents.");
  const documents = await Promise.all((docsResult.data || []).map(async doc => {
    const { data } = await supabase.storage.from("client-documents").createSignedUrl(doc.storage_path, 300);
    return { ...doc, url: data?.signedUrl || null };
  }));
  return <><Link href="/client/projects" className="cms-back">← All projects</Link><h1 className="client-title">{project.title}</h1>
    <p className="client-lede">{project.phase} · {project.status}</p>
    <section className="client-panel"><div className="client-meta"><span>Started: <strong>{humanDate(project.start_date)}</strong></span><span>Target: <strong>{humanDate(project.target_date)}</strong></span></div>
      <div className="client-progress-head"><h2>Project progress</h2><strong>{project.progress}%</strong></div>
      <div className="client-progress"><div style={{ width: `${project.progress}%` }}/></div>
      <p className="ops-preserve" style={{ marginTop:25 }}>{project.description || "Updates will be added as work progresses."}</p>
    </section>
    <section className="client-panel"><h2>Project documents</h2><p className="cms-hint">Secure download links expire after 5 minutes.</p>
      {documents.length ? documents.map(d=><div key={d.id} className="client-row"><span><strong>{d.label}</strong><small>{humanDate(d.created_at)}</small></span>{d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer">Open ↗</a> : <span>Unavailable</span>}</div>) : <p className="client-empty">No documents shared yet.</p>}
    </section>
  </>;
}

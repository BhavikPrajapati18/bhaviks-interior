import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/access";
import { humanDate } from "@/lib/admin-data";
import { ProjectTimeline } from "@/components/client/project-timeline";

export default async function ClientProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireClient();
  const [projectResult, docsResult, updatesResult] = await Promise.all([
    supabase.from("client_projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("client_documents").select("id,label,storage_path,created_at").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("client_project_updates").select("id,title,details,kind,occurred_at").eq("project_id", id).order("occurred_at", { ascending: false }).limit(60),
  ]);
  const project = projectResult.data;
  if (projectResult.error || !project) notFound();
  if (docsResult.error || updatesResult.error) throw new Error("Unable to load project updates or documents. Apply migration 009.");
  const documents = await Promise.all((docsResult.data || []).map(async doc => {
    const { data } = await supabase.storage.from("client-documents").createSignedUrl(doc.storage_path, 300);
    return { ...doc, url: data?.signedUrl || null, type: doc.storage_path.toLowerCase().endsWith(".pdf") ? "PDF" : "IMAGE" };
  }));
  return <>
    <Link href="/client/projects" className="cms-back">← All projects</Link>
    <h1 className="client-title">{project.title}</h1>
    <p className="client-lede">{project.phase} · {project.status.replaceAll("_", " ")}</p>
    <section className="client-panel"><div className="client-meta"><span>Started: <strong>{humanDate(project.start_date)}</strong></span><span>Target: <strong>{humanDate(project.target_date)}</strong></span></div>
      <div className="client-progress-head"><h2>Project progress</h2><strong>{project.progress}%</strong></div>
      <div className="client-progress" role="progressbar" aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Project completion percentage"><div style={{ width: `${project.progress}%` }}/></div>
      <p className="ops-preserve" style={{ marginTop: 25 }}>{project.description || "Updates will be added as work progresses."}</p>
    </section>
    <section className="client-panel"><h2>Project timeline</h2><p className="cms-hint">Milestones and updates published by your design team.</p>
      <ProjectTimeline entries={updatesResult.data || []}/>
    </section>
    <section className="client-panel"><h2>Project documents</h2><p className="cms-hint">Private files. Download links expire in 5 minutes.</p>
      {documents.length ? documents.map(d => <div key={d.id} className="client-row"><span><strong>{d.label}</strong><small>{d.type} · {humanDate(d.created_at)}</small></span>
        {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" download>View / download ↗</a> : <span>Unavailable</span>}
      </div>) : <p className="client-empty">No documents have been shared yet.</p>}
    </section>
  </>;
}

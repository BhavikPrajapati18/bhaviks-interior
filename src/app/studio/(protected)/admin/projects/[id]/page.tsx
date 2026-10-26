import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { getAdminReferences } from "@/lib/admin-data";
import { deleteClientDocument } from "@/lib/actions/admin";
import { ClientProjectForm, PrivateDocumentForm } from "@/components/admin/forms";
import { CmsHeading } from "@/components/studio/ui";

export default async function EditClientProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [result, refs, docs] = await Promise.all([
    supabase.from("client_projects").select("*").eq("id", id).maybeSingle(),
    getAdminReferences(),
    supabase.from("client_documents").select("id,label,storage_path").eq("project_id", id).order("created_at", { ascending:false })
  ]);
  if (!result.data) notFound();
  if (docs.error) throw new Error(docs.error.message);
  const links = await Promise.all((docs.data || []).map(async doc => {
    const { data } = await supabase.storage.from("client-documents").createSignedUrl(doc.storage_path, 300);
    return { ...doc, url: data?.signedUrl || null };
  }));
  return <><Link href="/studio/admin/projects" className="cms-back">← Client projects</Link><CmsHeading title="Manage client project" description="Update delivery progress and securely share project files."/>
    <ClientProjectForm initial={result.data} clients={refs.clients} leads={refs.leads}/>
    <PrivateDocumentForm projectId={id}/>
    <div className="cms-surface"><h2>Private documents</h2>{links.length ? <div className="ops-doc-list">{links.map(doc=><div key={doc.id}><span>{doc.label}</span>{doc.url ? <a target="_blank" rel="noopener noreferrer" href={doc.url}>View (5 min) ↗</a> : <span>Unavailable</span>}<form action={deleteClientDocument}><input type="hidden" name="document_id" value={doc.id}/><button type="submit" className="cms-danger-link">Delete</button></form></div>)}</div> : <p className="cms-empty">No documents yet.</p>}</div>
  </>;
}

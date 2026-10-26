import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsHeading } from "@/components/studio/ui";
import { ConfirmDeleteButton } from "@/components/studio/client-buttons";
import { RecordEditor } from "@/components/studio/record-editor";
import { requireEditor } from "@/lib/auth";
import { deleteProject } from "@/lib/actions/cms";
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const { supabase } = await requireEditor();
 const { data, error } = await supabase.from("portfolio_projects").select("*").eq("id",id).maybeSingle();
 if (error) throw new Error("Unable to load project: " + error.message);
 if (!data) notFound();
 return <><Link className="cms-back" href="/studio/projects">← Portfolio</Link><CmsHeading title="Edit project" description="Save changes or unpublish the record to hide it from public view."/>
 <RecordEditor mode="projects" initial={data}/>
 <form action={deleteProject} className="cms-danger-zone"><input type="hidden" name="id" value={id}/><div><strong>Delete project</strong><p>This permanently deletes this project. You can unpublish instead.</p></div><ConfirmDeleteButton /></form>
 </>;
}

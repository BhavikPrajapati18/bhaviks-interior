import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsHeading } from "@/components/studio/ui";
import { ConfirmDeleteButton } from "@/components/studio/client-buttons";
import { RecordEditor } from "@/components/studio/record-editor";
import { requireEditor } from "@/lib/auth";
import { deleteProcess } from "@/lib/actions/cms";
export default async function EditStepPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const { supabase } = await requireEditor();
 const { data, error } = await supabase.from("process_steps").select("*").eq("id",id).maybeSingle();
 if (error) throw new Error("Unable to load step: " + error.message);
 if (!data) notFound();
 return <><Link className="cms-back" href="/studio/process">← Design process</Link><CmsHeading title="Edit step" description="Save changes or unpublish the record to hide it from public view."/>
 <RecordEditor mode="process" initial={data}/>
 <form action={deleteProcess} className="cms-danger-zone"><input type="hidden" name="id" value={id}/><div><strong>Delete step</strong><p>This permanently deletes this step. You can unpublish instead.</p></div><ConfirmDeleteButton /></form>
 </>;
}

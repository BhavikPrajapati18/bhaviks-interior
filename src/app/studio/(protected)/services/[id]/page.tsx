import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsHeading } from "@/components/studio/ui";
import { ConfirmDeleteButton } from "@/components/studio/client-buttons";
import { RecordEditor } from "@/components/studio/record-editor";
import { requireEditor } from "@/lib/auth";
import { deleteService } from "@/lib/actions/cms";
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const { supabase } = await requireEditor();
 const { data, error } = await supabase.from("services").select("*").eq("id",id).maybeSingle();
 if (error) throw new Error("Unable to load service: " + error.message);
 if (!data) notFound();
 return <><Link className="cms-back" href="/studio/services">← Services</Link><CmsHeading title="Edit service" description="Save changes or unpublish the record to hide it from public view."/>
 <RecordEditor mode="services" initial={data}/>
 <form action={deleteService} className="cms-danger-zone"><input type="hidden" name="id" value={id}/><div><strong>Delete service</strong><p>This permanently deletes this service. You can unpublish instead.</p></div><ConfirmDeleteButton /></form>
 </>;
}

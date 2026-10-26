import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsHeading } from "@/components/studio/ui";
import { ConfirmDeleteButton } from "@/components/studio/client-buttons";
import { RecordEditor } from "@/components/studio/record-editor";
import { requireEditor } from "@/lib/auth";
import { deleteFaq } from "@/lib/actions/cms";
export default async function EditFAQPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const { supabase } = await requireEditor();
 const { data, error } = await supabase.from("faqs").select("*").eq("id",id).maybeSingle();
 if (error) throw new Error("Unable to load faq: " + error.message);
 if (!data) notFound();
 return <><Link className="cms-back" href="/studio/faqs">← FAQs</Link><CmsHeading title="Edit faq" description="Save changes or unpublish the record to hide it from public view."/>
 <RecordEditor mode="faqs" initial={data}/>
 <form action={deleteFaq} className="cms-danger-zone"><input type="hidden" name="id" value={id}/><div><strong>Delete faq</strong><p>This permanently deletes this faq. You can unpublish instead.</p></div><ConfirmDeleteButton /></form>
 </>;
}

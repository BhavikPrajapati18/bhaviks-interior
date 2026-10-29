import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEditor } from "@/lib/auth";
import { JournalEditor } from "@/components/studio/journal-editor";
import { CmsHeading } from "@/components/studio/ui";
import type { JournalPost } from "@/lib/journal";
export default async function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireEditor();
  const { data, error } = await supabase.from("journal_posts").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  return <><Link className="cms-back" href="/studio/journal">← Journal</Link>
    <CmsHeading title="Edit article" description="Update the article content, SEO, image and publication status."/>
    <JournalEditor initial={data as JournalPost}/></>;
}

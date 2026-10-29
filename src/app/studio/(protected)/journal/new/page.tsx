import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { JournalEditor } from "@/components/studio/journal-editor";
export default function NewArticlePage() {
  return <><Link className="cms-back" href="/studio/journal">← Journal</Link>
    <CmsHeading title="New article" description="Create a draft, then publish it when the content is ready."/>
    <JournalEditor/></>;
}

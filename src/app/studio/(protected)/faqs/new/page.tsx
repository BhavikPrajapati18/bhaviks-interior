import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { RecordEditor } from "@/components/studio/record-editor";
export default function NewFAQPage() {
 return <><Link className="cms-back" href="/studio/faqs">← FAQs</Link><CmsHeading title="New faq" description="Start as a draft and publish when ready."/>
 <RecordEditor mode="faqs"/></>;
}

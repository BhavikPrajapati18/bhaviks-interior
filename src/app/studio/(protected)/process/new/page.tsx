import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { RecordEditor } from "@/components/studio/record-editor";
export default function NewStepPage() {
 return <><Link className="cms-back" href="/studio/process">← Design process</Link><CmsHeading title="New step" description="Start as a draft and publish when ready."/>
 <RecordEditor mode="process"/></>;
}

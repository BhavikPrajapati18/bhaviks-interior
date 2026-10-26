import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { RecordEditor } from "@/components/studio/record-editor";
export default function NewProjectPage() {
 return <><Link className="cms-back" href="/studio/projects">← Portfolio</Link><CmsHeading title="New project" description="Start as a draft and publish when ready."/>
 <RecordEditor mode="projects"/></>;
}

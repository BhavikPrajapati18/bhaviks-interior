import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { RecordEditor } from "@/components/studio/record-editor";
export default function NewServicePage() {
 return <><Link className="cms-back" href="/studio/services">← Services</Link><CmsHeading title="New service" description="Start as a draft and publish when ready."/>
 <RecordEditor mode="services"/></>;
}

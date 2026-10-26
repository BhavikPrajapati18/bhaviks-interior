import Link from "next/link";
import { getAdminReferences } from "@/lib/admin-data";
import { ClientProjectForm } from "@/components/admin/forms";
import { CmsHeading } from "@/components/studio/ui";
export default async function NewClientProject() {
  const { clients, leads } = await getAdminReferences();
  return <><Link href="/studio/admin/projects" className="cms-back">← Client projects</Link><CmsHeading title="New client project" description="Create a secure progress tracker for a linked client."/><ClientProjectForm clients={clients} leads={leads}/></>;
}

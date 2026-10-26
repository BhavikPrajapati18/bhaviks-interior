import Link from "next/link";
import { getAdminReferences } from "@/lib/admin-data";
import { QuoteForm } from "@/components/admin/forms";
import { CmsHeading } from "@/components/studio/ui";
export default async function NewQuote() {
  const { clients, leads } = await getAdminReferences();
  return <><Link href="/studio/admin/quotes" className="cms-back">← Quotations</Link><CmsHeading title="New quotation" description="Choose a linked client first. Keep as draft until ready."/><QuoteForm clients={clients} leads={leads}/></>;
}

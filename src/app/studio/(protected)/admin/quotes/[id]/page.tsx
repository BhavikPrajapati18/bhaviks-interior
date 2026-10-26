import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { getAdminReferences } from "@/lib/admin-data";
import { QuoteForm } from "@/components/admin/forms";
import { CmsHeading } from "@/components/studio/ui";
export default async function EditQuote({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [result, refs] = await Promise.all([
    supabase.from("client_quotes").select("*").eq("id", id).maybeSingle(), getAdminReferences()
  ]);
  if (!result.data) notFound();
  return <><Link href="/studio/admin/quotes" className="cms-back">← Quotations</Link><CmsHeading title="Edit quotation" description="Shared quotes appear only in the assigned client's account."/><QuoteForm initial={result.data} clients={refs.clients} leads={refs.leads}/></>;
}

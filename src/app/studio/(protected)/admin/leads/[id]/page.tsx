import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { getAdminReferences, humanDate } from "@/lib/admin-data";
import { LeadForm } from "@/components/admin/forms";
import { CmsHeading } from "@/components/studio/ui";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [leadResult, refs] = await Promise.all([
    supabase.from("inquiries").select("*").eq("id", id).maybeSingle(), getAdminReferences()
  ]);
  const lead = leadResult.data;
  if (!lead) notFound();
  return <><Link className="cms-back" href="/studio/admin/leads">← All leads</Link><CmsHeading title={lead.full_name} description={`Enquiry received ${humanDate(lead.created_at)}`}/>
    <div className="cms-surface ops-detail"><p><strong>Email</strong><span>{lead.email}</span></p><p><strong>Phone</strong><span>{lead.phone || "—"}</span></p><p><strong>Message</strong><span className="ops-preserve">{lead.message}</span></p></div>
    <LeadForm lead={lead} clients={refs.clients}/>
  </>;
}

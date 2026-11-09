import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/access";
import { respondToQuote } from "@/lib/actions/client";
import { price, humanDate } from "@/lib/admin-data";

const statusInfo: Record<string, { title: string; text: string }> = {
  shared: { title: "Awaiting your decision", text: "Review the scope, amount and validity before responding." },
  accepted: { title: "Quotation accepted", text: "Your response has been recorded. The team will coordinate the next steps." },
  declined: { title: "Quotation declined", text: "Your response has been recorded. Contact the studio if you'd like to revisit the scope." },
};

export default async function ClientQuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireClient();
  const { data, error } = await supabase.from("client_quotes").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  const expired = Boolean(data.status === "shared" && data.valid_until && data.valid_until < new Date().toISOString().slice(0, 10));
  const canRespond = data.status === "shared" && !expired;
  const info = expired
    ? { title: "Quotation expired", text: "This quotation is past its validity date. Please request a revised estimate." }
    : statusInfo[data.status] || { title: data.status, text: "Check the quotation details below." };
  return <>
    <Link href="/client/quotes" className="cms-back">← All quotations</Link>
    <h1 className="client-title">{data.title}</h1>
    <p className="client-lede">Your personalised estimate and design scope.</p>
    <div className="client-status-banner" role="status"><span>{info.title}</span><p>{info.text}</p></div>
    <section className="client-panel client-quote-detail">
      <div className="client-meta"><span>Status: <strong>{data.status}</strong></span><span>Valid until: <strong>{humanDate(data.valid_until)}</strong></span></div>
      <div className="client-amount">{price(data.amount)}</div>
      <h2>Scope of work</h2><p className="ops-preserve">{data.description || "No additional scope description."}</p>
      <p style={{ marginTop: 28 }}><a className="btn btn-outline" href={`/api/quotes/${id}/pdf`}>Download quotation PDF ↓</a></p>
      {canRespond && <div className="client-decision">
        <form action={respondToQuote}><input type="hidden" name="id" value={id}/><input type="hidden" name="decision" value="accepted"/><button type="submit" className="btn btn-primary">Accept quotation</button></form>
        <form action={respondToQuote}><input type="hidden" name="id" value={id}/><input type="hidden" name="decision" value="declined"/><button type="submit" className="btn btn-outline">Decline quotation</button></form>
      </div>}
      <p className="cms-hint" style={{ marginTop: 24 }}>Accepting records your decision; no online payment is collected. Only shared quotations can be responded to.</p>
    </section>
  </>;
}

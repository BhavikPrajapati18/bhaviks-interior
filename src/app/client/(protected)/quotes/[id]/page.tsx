import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/access";
import { respondToQuote } from "@/lib/actions/client";
import { price, humanDate } from "@/lib/admin-data";
export default async function ClientQuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireClient();
  const { data, error } = await supabase.from("client_quotes").select("*").eq("id",id).maybeSingle();
  if (error || !data) notFound();
  const canRespond = data.status === "shared" && (!data.valid_until || data.valid_until >= new Date().toISOString().slice(0,10));
  return <><Link href="/client/quotes" className="cms-back">← All quotations</Link><h1 className="client-title">{data.title}</h1>
    <p className="client-lede">Review the scope and quote details below.</p>
    <section className="client-panel client-quote-detail"><div className="client-meta"><span>Status: <strong>{data.status}</strong></span><span>Valid until: <strong>{humanDate(data.valid_until)}</strong></span></div>
      <div className="client-amount">{price(data.amount)}</div><p className="ops-preserve">{data.description || "No additional scope description."}</p>
      {canRespond && <div className="client-decision"><form action={respondToQuote}><input type="hidden" name="id" value={id}/><input type="hidden" name="decision" value="accepted"/><button className="btn btn-primary">Accept quotation</button></form>
        <form action={respondToQuote}><input type="hidden" name="id" value={id}/><input type="hidden" name="decision" value="declined"/><button className="btn btn-outline">Decline</button></form></div>}
      {data.status === "shared" && !canRespond && <p className="cms-hint">This quotation has expired. Contact the studio for an updated version.</p>}
      <p className="cms-hint">Accepting this quotation records your response. No payment is collected online.</p>
    </section>
  </>;
}

import Link from "next/link";
import { requireClient } from "@/lib/access";
import { price, humanDate } from "@/lib/admin-data";
export default async function ClientQuotes() {
  const { supabase } = await requireClient();
  const { data, error } = await supabase.from("client_quotes")
    .select("id,title,amount,status,valid_until").order("created_at", { ascending:false });
  if (error) throw new Error("Unable to load quotations.");
  return <><h1 className="client-title">Your quotations</h1><p className="client-lede">Estimates shared with your account.</p>
    <div className="client-panel">{data?.length ? data.map(q=><Link key={q.id} href={`/client/quotes/${q.id}`} className="client-row"><span><strong>{q.title}</strong><small>{q.status} · Valid until {humanDate(q.valid_until)}</small></span><b>{price(q.amount)} ↗</b></Link>) : <p className="client-empty">No quotations have been shared yet.</p>}</div>
  </>;
}

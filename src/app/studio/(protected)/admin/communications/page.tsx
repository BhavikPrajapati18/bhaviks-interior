import Link from "next/link";
import {requireAdmin} from "@/lib/access";
import {CmsHeading} from "@/components/studio/ui";
export default async function CommunicationLog(){
  const {supabase}=await requireAdmin();
  const {data,error}=await supabase.from("communication_outbox")
    .select("id,channel,status,attempts,last_error,created_at,provider_message_id")
    .order("created_at",{ascending:false}).limit(100);
  if(error)throw new Error("Delivery logs unavailable. Apply migration 007.");
  return <>
    <Link className="cms-back" href="/studio/admin">← Admin dashboard</Link>
    <CmsHeading title="Communication delivery log" description="Queued, provider-accepted and delivery status. Actual delivery is only confirmed when a webhook reports it."/>
    <div className="cms-surface" style={{overflowX:"auto"}}>
      <p className="body-text">Sending is OFF until enabled in your server environment. Only the latest 100 events appear here.</p>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:650}}>
        <thead><tr>{["Created","Channel","Status","Attempts","Details"].map(s=><th key={s} style={{textAlign:"left",padding:12,borderBottom:"1px solid #cbbdb0"}}>{s}</th>)}</tr></thead>
        <tbody>{(data??[]).map(row=><tr key={row.id}>
          <td style={{padding:12,borderBottom:"1px solid #e0d5cc"}}>{new Date(row.created_at).toLocaleString("en-IN")}</td>
          <td style={{padding:12}}>{row.channel}</td><td style={{padding:12}}>{row.status}</td>
          <td style={{padding:12}}>{row.attempts}</td><td style={{padding:12}}>{row.last_error||"—"}</td>
        </tr>)}</tbody>
      </table>
      {!data?.length&&<p className="body-text">No delivery jobs yet. New in-app notifications will appear here after migration 007.</p>}
    </div>
  </>;
}

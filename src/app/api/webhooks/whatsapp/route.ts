import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
export const runtime="nodejs";

export async function GET(req:NextRequest) {
  const url=req.nextUrl;
  const verified=url.searchParams.get("hub.mode")==="subscribe" &&
    Boolean(process.env.META_WHATSAPP_VERIFY_TOKEN) &&
    url.searchParams.get("hub.verify_token")===process.env.META_WHATSAPP_VERIFY_TOKEN;
  const challenge=url.searchParams.get("hub.challenge");
  return verified && challenge ? new Response(challenge,{status:200}) :
    new Response("Forbidden",{status:403});
}

type MetaStatus = {id?:string;status?:string;errors?:Array<{title?:string}>};
export async function POST(req:NextRequest) {
  const secret=process.env.META_APP_SECRET;
  if (!secret) return new Response("Not configured",{status:503});
  const raw=await req.text();
  if(raw.length>500_000) return new Response("Too large",{status:413});
  const incoming=req.headers.get("x-hub-signature-256")||"";
  const digest=`sha256=${createHmac("sha256",secret).update(raw).digest("hex")}`;
  if (incoming.length!==digest.length ||
      !timingSafeEqual(Buffer.from(incoming),Buffer.from(digest)))
    return new Response("Unauthorized",{status:401});
  let payload:unknown;
  try {payload=JSON.parse(raw);} catch {return new Response("Invalid JSON",{status:400});}
  const top=payload as {entry?:Array<{changes?:Array<{value?:{statuses?:MetaStatus[]}}>}>};
  if (!Array.isArray(top?.entry)) return NextResponse.json({ok:true});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return new Response("Not configured",{status:503});
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  for(const entry of top.entry.slice(0,20)) for(const change of (entry.changes??[]).slice(0,20)) {
    for(const status of (change.value?.statuses??[]).slice(0,100)) {
      if(!status.id || !["sent","delivered","read","failed"].includes(status.status??""))continue;
      // "sent" is provider acceptance, not recipient delivery.
      if(status.status==="sent")continue;
      const next=status.status==="failed"?"failed":status.status;
      const values:Record<string,unknown>={status:next};
      if(next==="failed")values.last_error=(status.errors?.[0]?.title||"WhatsApp delivery failed").slice(0,240);
      let query=db.from("communication_outbox").update(values)
        .eq("provider_message_id",status.id).eq("channel","whatsapp");
      // Never regress read -> delivered or delivered -> failed due to out-of-order callbacks.
      if(next==="delivered") query=query.eq("status","accepted");
      if(next==="read")query=query.in("status",["accepted","delivered"]);
      if(next==="failed")query=query.eq("status","accepted");
      const {error}=await query;
      if(error){console.error("[WhatsApp webhook] database update failed");return new Response("Retry later",{status:500});}
    }
  }
  return NextResponse.json({ok:true});
}

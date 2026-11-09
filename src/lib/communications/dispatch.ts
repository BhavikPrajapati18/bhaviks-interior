import "server-only";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, sendWhatsApp, type Channel } from "./provider";

type Job = {
  id:string; notification_id:string; recipient_user_id:string;
  channel:Channel; attempts:number; created_at:string;
};
type Notification = {title:string;message:string;link_href:string};
type Prefs = {email_enabled:boolean;whatsapp_e164:string|null;whatsapp_opt_in_at:string|null};

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Service role configuration is missing");
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

export async function processCommunicationQueue(limit = 5) {
  if (process.env.COMMUNICATIONS_ENABLED !== "true")
    return {enabled:false,processed:0,accepted:0,failed:0,skipped:0};
  const channels:Channel[] = [];
  if (process.env.COMMUNICATIONS_EMAIL_ENABLED === "true") channels.push("email");
  if (process.env.COMMUNICATIONS_WHATSAPP_ENABLED === "true") channels.push("whatsapp");
  if (!channels.length) return {enabled:false,processed:0,accepted:0,failed:0,skipped:0};
  const db = serviceClient();
  const result = await db.rpc("claim_communication_jobs",{
    p_limit:Math.min(Math.max(limit,1),10),p_channels:channels
  });
  if (result.error) throw new Error(`Outbox claim failed: ${result.error.message}`);
  const jobs = (result.data ?? []) as Job[];
  let accepted=0,failed=0,skipped=0;
  for (const job of jobs) {
    const update = async (fields:Record<string,unknown>) => {
      const {error} = await db.from("communication_outbox").update(fields)
        .eq("id",job.id).eq("status","processing");
      if (error) throw new Error(`Outbox update failed: ${error.message}`);
    };
    try {
      // Prevent old notifications from unexpectedly being blasted when a channel is activated.
      if (Date.now() - new Date(job.created_at).getTime() > 24*60*60*1000) {
        await update({status:"skipped",last_error:"Notification older than 24 hours"});
        skipped++; continue;
      }
      const [{data:notice,error:noticeError},{data:pref,error:prefError},account] = await Promise.all([
        db.from("notifications").select("title,message,link_href").eq("id",job.notification_id).single(),
        db.from("communication_preferences").select("email_enabled,whatsapp_e164,whatsapp_opt_in_at")
          .eq("user_id",job.recipient_user_id).maybeSingle(),
        db.auth.admin.getUserById(job.recipient_user_id)
      ]);
      if (noticeError || prefError || account.error || !notice || !account.data.user) {
        throw new Error("Recipient or notification lookup failed");
      }
      const n = notice as Notification;
      const p = pref as Prefs|null;
      let response;
      if (job.channel === "email") {
        const email = account.data.user.email;
        if (p?.email_enabled === false || !email || !account.data.user.email_confirmed_at) {
          await update({status:"skipped",last_error:"Email disabled or unconfirmed"}); skipped++; continue;
        }
        response = await sendEmail({to:email,title:n.title,message:n.message,link:n.link_href,
          idempotencyKey:`bi-${job.id}`});
      } else {
        // The number + explicit consent are rechecked immediately before every send.
        if (!p?.whatsapp_opt_in_at || !p.whatsapp_e164) {
          await update({status:"skipped",last_error:"No WhatsApp opt-in"}); skipped++; continue;
        }
        response = await sendWhatsApp({to:p.whatsapp_e164,title:n.title});
      }
      await update({status:"accepted",provider_message_id:response.id,last_error:null});
      accepted++;
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0,240) : "Unexpected send error";
      const permanent = /Provider HTTP 4(?!29)\d\d|Invalid phone number|Unsafe notification URL/.test(message);
      const retry = !permanent && job.attempts < 3;
      await update({status:retry?"retry":"failed",last_error:message,
        next_attempt_at:new Date(Date.now()+Math.min(60,2**job.attempts*2)*60_000).toISOString()});
      failed++;
    }
  }
  return {enabled:true,processed:jobs.length,accepted,failed,skipped};
}

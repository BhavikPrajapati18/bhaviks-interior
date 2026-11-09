import "server-only";

export type Channel = "email" | "whatsapp";
export type SendResult = { id: string };

function safeUrl(path: string) {
  if (!/^\/(?!\/)[\w/%-]+(?:\/[\w/%-]+)*$/.test(path)) throw new Error("Unsafe notification URL");
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base || !/^https?:\/\//.test(base)) throw new Error("NEXT_PUBLIC_SITE_URL is not configured");
  const parsed = new URL(base);
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("Production site URL must use HTTPS");
  }
  return new URL(path, parsed.origin).href;
}
const htmlEscape = (text: string) => text.replace(/[&<>"']/g, c =>
  ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c] ?? c);

async function apiResponse(response: Response): Promise<SendResult> {
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const err = data && typeof data === "object" && "error" in data ?
      JSON.stringify((data as {error:unknown}).error).slice(0, 240) : `HTTP ${response.status}`;
    throw new Error(`Provider HTTP ${response.status}: ${err}`);
  }
  if (!data || typeof data !== "object") throw new Error("Unexpected provider response");
  const maybe = data as {id?:unknown;messages?:{id?:string}[]};
  const id = typeof maybe.id === "string" ? maybe.id : maybe.messages?.[0]?.id;
  if (!id) throw new Error("Provider did not return a message ID");
  return { id };
}

export async function sendEmail({to,title,message,link,idempotencyKey}: {
  to:string;title:string;message:string;link:string;idempotencyKey:string;
}): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) throw new Error("Resend not configured");
  const href = safeUrl(link);
  const response = await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{
      Authorization:`Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type":"application/json",
      "Idempotency-Key": idempotencyKey
    },
    body:JSON.stringify({
      from:process.env.RESEND_FROM_EMAIL, to:[to], subject:`Bhavik's Interior — ${title}`,
      html:`<div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;color:#341f16;padding:32px"><h1 style="font-size:25px">${htmlEscape(title)}</h1><p style="line-height:1.8">${htmlEscape(message)}</p><a href="${htmlEscape(href)}" style="background:#805231;color:white;padding:12px 18px;display:inline-block;text-decoration:none">View in your account</a><p style="font-size:12px;color:#7b6859">Bhavik's Interior · Transactional account notification</p></div>`,
      text:`${title}\n\n${message}\n\nView in your account: ${href}`
    }),
    cache:"no-store",
    signal:AbortSignal.timeout(15000)
  });
  return apiResponse(response);
}

export async function sendWhatsApp({to,title}: {to:string;title:string}): Promise<SendResult> {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const template = process.env.META_WHATSAPP_TEMPLATE_NAME;
  if (!token || !phoneId || !template) throw new Error("Meta WhatsApp not configured");
  if (!/^\+[1-9][0-9]{7,14}$/.test(to)) throw new Error("Invalid phone number");
  const version = process.env.META_GRAPH_VERSION || "";
  if (!/^v\d+\.\d+$/.test(version) || !/^\d+$/.test(phoneId)) throw new Error("Invalid Meta endpoint settings");
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method:"POST",
    headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
    body:JSON.stringify({
      messaging_product:"whatsapp", to:to.slice(1), type:"template",
      template:{ name:template, language:{code:process.env.META_WHATSAPP_LANGUAGE || "en_US"},
        components:[{type:"body",parameters:[{type:"text",text:title.slice(0,160)}]}] }
    }),
    cache:"no-store",
    signal:AbortSignal.timeout(15000)
  });
  return apiResponse(response);
}

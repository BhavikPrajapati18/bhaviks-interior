"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireClient } from "@/lib/access";

export type PreferenceState={error:string;message:string};
const phoneSchema=z.union([z.literal(""),z.string().regex(/^\+[1-9][0-9]{7,14}$/)]);
export async function saveCommunicationPreferences(
  _state:PreferenceState,form:FormData
):Promise<PreferenceState>{
  const {supabase,user}=await requireClient();
  const phone=phoneSchema.safeParse(String(form.get("whatsapp_e164")||"").trim());
  if(!phone.success)return {error:"Use a phone number with country code, for example +919876543210.",message:""};
  const optIn=form.get("whatsapp_opt_in")==="on";
  if(optIn && !phone.data)return {error:"Enter a WhatsApp number before opting in.",message:""};
  const {data:old}=await supabase.from("communication_preferences")
    .select("whatsapp_e164,whatsapp_opt_in_at").eq("user_id",user.id).maybeSingle();
  const unchanged=old?.whatsapp_e164===phone.data && old?.whatsapp_opt_in_at;
  const {error}=await supabase.from("communication_preferences").upsert({
    user_id:user.id, email_enabled:form.get("email_enabled")==="on",
    whatsapp_e164:phone.data||null,
    whatsapp_opt_in_at:optIn?(unchanged?old.whatsapp_opt_in_at:new Date().toISOString()):null
  },{onConflict:"user_id"});
  if(error)return {error:"Could not save preferences. Make sure migration 007 is applied.",message:""};
  revalidatePath("/client/settings");
  return {error:"",message:"Your communication preferences were saved."};
}

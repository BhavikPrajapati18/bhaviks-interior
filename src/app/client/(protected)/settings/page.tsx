import {requireClient} from "@/lib/access";
import {CommunicationPreferencesForm} from "@/components/notifications/communication-preferences-form";
export default async function ClientSettings(){
  const {supabase,user}=await requireClient();
  const {data,error}=await supabase.from("communication_preferences")
    .select("email_enabled,whatsapp_e164,whatsapp_opt_in_at")
    .eq("user_id",user.id).maybeSingle();
  if(error)throw new Error("Could not load preferences. Apply migration 007 first.");
  return <section><p className="client-greeting">ACCOUNT / COMMUNICATIONS</p>
    <h1>Notification settings</h1>
    <CommunicationPreferencesForm initial={data}/>
  </section>;
}

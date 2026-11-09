import Link from "next/link";
import { requireClient } from "@/lib/access";
import { ClientContactForm } from "@/components/client/contact-form";

export default async function ClientProfilePage() {
  const { supabase, user, account } = await requireClient();
  const { data, error } = await supabase.from("client_contact_details")
    .select("phone,city,address,preferred_contact_method")
    .eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Could not load your contact profile. Apply migration 009.");
  return <>
    <h1 className="client-title">Your profile</h1>
    <p className="client-lede">Keep your contact information up to date for a smoother project experience.</p>
    <div className="client-panel">
      <div className="client-meta"><span>Name: <strong>{account.full_name}</strong></span><span>Email: <strong>{account.email}</strong></span></div>
      <p className="cms-hint">Your verified account identity is managed by the studio. To correct your name or login email, contact the team.</p>
    </div>
    <ClientContactForm initial={data}/>
    <p className="cms-hint">Notification permissions: <Link href="/client/settings">Manage email and WhatsApp settings</Link></p>
  </>;
}

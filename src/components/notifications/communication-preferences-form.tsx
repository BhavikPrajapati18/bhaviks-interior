"use client";
import { useActionState } from "react";
import {saveCommunicationPreferences} from "@/lib/actions/communication-preferences";

type Prefs={email_enabled:boolean;whatsapp_e164:string|null;whatsapp_opt_in_at:string|null};
export function CommunicationPreferencesForm({initial}:{initial:Prefs|null}) {
  const [state,action,pending]=useActionState(saveCommunicationPreferences,{error:"",message:""});
  return <form action={action} className="cms-surface" style={{maxWidth:680,display:"grid",gap:18}}>
    <h2>Delivery preferences</h2>
    <p className="body-text">In-app notifications stay available regardless of these settings. Email and WhatsApp sending are optional.</p>
    <label style={{display:"flex",gap:10,alignItems:"center"}}>
      <input type="checkbox" name="email_enabled" defaultChecked={initial?.email_enabled ?? true}/>
      Receive transactional account emails
    </label>
    <label style={{display:"grid",gap:8}}>
      WhatsApp number (include country code)
      <input className="cms-input" type="tel" name="whatsapp_e164" placeholder="+919876543210" defaultValue={initial?.whatsapp_e164??""}/>
    </label>
    <label style={{display:"flex",gap:10,alignItems:"flex-start"}}>
      <input type="checkbox" name="whatsapp_opt_in" defaultChecked={Boolean(initial?.whatsapp_opt_in_at)}/>
      <span>I explicitly agree to receive project and quotation updates via WhatsApp. I can withdraw this consent here.</span>
    </label>
    <p className="body-text">WhatsApp messages may be chargeable to the business. No promotional messages will be sent through these settings.</p>
    <button className="btn btn-primary" type="submit" disabled={pending}>{pending?"Saving…":"Save preferences"}</button>
    {state.error&&<p role="alert" style={{color:"#a32822"}}>{state.error}</p>}
    {state.message&&<p role="status">{state.message}</p>}
  </form>;
}

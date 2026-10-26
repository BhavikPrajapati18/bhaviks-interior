import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { getSiteConfig } from "@/lib/content/queries";
export const metadata: Metadata = { title: "Get in Touch", description: "Start a conversation about your interior design project." };
export default async function ContactPage() {
  const config = await getSiteConfig();
  return <><header className="page-header"><div className="container"><span className="eyebrow">{config.contact_page_eyebrow}</span><h1 className="h1">{config.contact_page_heading}</h1><p className="page-lead">{config.contact_page_description}</p></div></header>
    <section className="section"><div className="container contact-layout">
      <div><span className="eyebrow kicker">START A CONVERSATION</span><h2 className="h2" style={{marginTop:20}}>YOUR SPACE. OUR NEXT STORY.</h2><p className="body-text" style={{marginTop:26}}>Whether it&apos;s an entire home or one room, the first step is a thoughtful conversation.</p>
        <div className="contact-details"><p className="body-text">Use the form to share your project ideas and we&apos;ll be in touch.</p>
        {config.contact_email && <p className="body-text"><a href={`mailto:${config.contact_email}`}>{config.contact_email}</a></p>}
        {config.contact_phone && <p className="body-text"><a href={`tel:${config.contact_phone.replace(/[^+\d]/g, "")}`}>{config.contact_phone}</a></p>}</div>
      </div>
      <div><ContactForm/></div>
    </div></section>
  </>;
}

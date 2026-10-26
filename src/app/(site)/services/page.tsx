import type { Metadata } from "next";
import { ServiceCards } from "@/components/site/cards";
import { SectionCTA } from "@/components/site/section-cta";
import { getHomepageContent } from "@/lib/content/queries";
export const metadata: Metadata = { title: "Services", description: "Discover residential, commercial and bespoke interior design services." };
export default async function ServicesPage() {
  const { services, config } = await getHomepageContent();
  return <><header className="page-header"><div className="container"><span className="eyebrow">{config.services_page_eyebrow}</span><h1 className="h1">{config.services_page_heading}</h1><p className="page-lead">{config.services_page_description}</p></div></header>
    <section className="section"><div className="container"><ServiceCards services={services}/></div></section><SectionCTA/></>;
}

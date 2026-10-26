import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { SectionCTA } from "@/components/site/section-cta";
import { getHomepageContent } from "@/lib/content/queries";
export const metadata: Metadata = { title: "Our Approach", description: "The design thinking and philosophy behind Bhavik's Interior." };
export default async function AboutPage() {
  const { config } = await getHomepageContent();
  return <><header className="page-header"><div className="container"><span className="eyebrow">{config.about_page_eyebrow}</span><h1 className="h1">{config.about_page_heading}</h1><p className="page-lead">{config.about_page_description}</p></div></header>
    <section className="section"><div className="container story-layout"><div className="story-image"><Image src={config.story_image} alt="Material-rich contemporary living space" fill sizes="(max-width: 800px) 100vw, 50vw" unoptimized style={{objectFit:"cover"}}/></div>
    <div className="story-copy"><span className="eyebrow kicker">{config.introduction_eyebrow}</span><h2 className="h2">{config.introduction_heading}</h2><p className="body-text">{config.introduction_body}</p><Link href="/contact" className="text-link" style={{marginTop:35}}>Talk about your space <ArrowUpRight size={18}/></Link></div></div></section><SectionCTA/></>;
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteConfig } from "@/lib/content/queries";
export async function SectionCTA() {
  const config = await getSiteConfig();
  return <section className="full-bleed-cta" style={{backgroundImage: `linear-gradient(90deg,rgba(33,21,15,.85),rgba(33,21,15,.45)), url("${config.cta_image.replaceAll('"', '%22')}")`}}><div className="container">
    <span className="eyebrow">BEGIN WITH A CONVERSATION</span>
    <h2 className="h2">{config.cta_heading}</h2>
    <p style={{maxWidth:540,marginBottom:26,lineHeight:1.8}}>{config.cta_description}</p>
    <Link className="btn btn-light" href="/contact">Start your project <ArrowUpRight size={18}/></Link>
  </div></section>;
}

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { ServiceCards, ProjectCards, FaqList } from "@/components/site/cards";
import { SectionCTA } from "@/components/site/section-cta";
import { getHomepageContent, getSiteConfig } from "@/lib/content/queries";
import type { Metadata } from "next";
export async function generateMetadata(): Promise<Metadata> { const config = await getSiteConfig(); return { title: { absolute: config.seo_title }, description: config.seo_description }; }

export default async function HomePage() {
  const { config, services, projects, faqs, process, demo } = await getHomepageContent();
  return <>
    <section className="hero">
      <Image className="hero-image" src={config.hero_image} alt="Warm contemporary interior with considered materials" fill priority sizes="100vw" unoptimized />
      <div className="hero-content"><div className="container">
        <span className="eyebrow">{config.hero_eyebrow}</span>
        <h1 className="h1">{config.hero_heading}</h1>
        <p className="hero-copy">{config.hero_description}</p>
        <Link href="/contact" className="btn btn-light">Start your project <ArrowUpRight size={18}/></Link>
      </div></div>
      <div className="hero-footer"><div className="container hero-footer-inner"><p>Thoughtful spaces / Timeless design</p><p className="scroll-hint">Explore below <ArrowDown size={17}/></p></div></div>
    </section>
    <section className="section"><div className="container story-layout">
      <div className="story-image"><Image src={config.story_image} alt="Warm-toned contemporary interior with natural materials" fill sizes="(max-width: 800px) 100vw, 50vw" unoptimized style={{objectFit:"cover"}} /></div>
      <div className="story-copy"><span className="eyebrow kicker">{config.introduction_eyebrow}</span>
        <h2 className="h2">{config.introduction_heading}</h2>
        <p className="body-text">{config.introduction_body}</p>
        <div className="story-number"><strong>01</strong><small>One thoughtful approach<br/>A space that&apos;s yours</small></div>
        <Link href="/about" className="text-link" style={{ marginTop: 35 }}>Discover our approach <ArrowUpRight size={18}/></Link>
      </div>
    </div></section>
    <section className="section" style={{background:"var(--color-surface)"}}><div className="container">
      <div className="section-topline editorial-head"><div><span className="eyebrow kicker">{config.services_eyebrow}</span><h2 className="h2">{config.services_heading}</h2></div><div><p className="body-text">{config.services_description}</p><Link className="text-link" href="/services">All services <ArrowUpRight size={17}/></Link></div></div>
      <ServiceCards services={services.slice(0, 3)}/>
    </div></section>
    <section className="section"><div className="container">
      <div className="section-topline editorial-head"><div><span className="eyebrow kicker">{config.projects_eyebrow}</span><h2 className="h2">{config.projects_heading}</h2></div><div><p className="body-text">{config.projects_description}</p><Link className="text-link" href="/projects">Explore projects <ArrowUpRight size={17}/></Link></div></div>
      {demo && <p className="preview-note" style={{marginTop:22}}>Concept visuals for layout preview — not completed client projects.</p>}
      <ProjectCards projects={projects.slice(0,4)} />
    </div></section>
    <section className="section dark-section"><div className="container">
      <div className="section-topline editorial-head" style={{borderColor:"#ffffff50"}}><div><span className="eyebrow kicker">{config.process_eyebrow}</span><h2 className="h2">{config.process_heading}</h2></div><p className="body-text">{config.process_description}</p></div>
      <div className="process-grid">{process.map((step, i) => <div className="process-step" key={step.id}><span className="num">{String(i+1).padStart(2,"0")} / {String(process.length).padStart(2,"0")}</span><h3>{step.title}</h3><p>{step.description}</p></div>)}</div>
    </div></section>
    <section className="section"><div className="container">
      <div className="section-topline editorial-head"><div><span className="eyebrow kicker">{config.faq_eyebrow}</span><h2 className="h2">{config.faq_heading}</h2></div><p className="body-text">{config.faq_description}</p></div>
      <FaqList faqs={faqs}/>
    </div></section>
    <SectionCTA/>
  </>;
}

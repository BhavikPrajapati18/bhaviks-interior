import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getServiceBySlug } from "@/lib/content/queries";
import { SectionCTA } from "@/components/site/section-cta";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{slug: string}> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  return service ? { title: service.meta_title || service.title, description: service.meta_description || service.description } : {};
}
export default async function ServiceDetail({ params }: { params: Promise<{slug: string}> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();
  return <><header className="page-header"><div className="container"><span className="eyebrow">{service.category} / SERVICES</span><h1 className="h1">{service.title}</h1><p className="page-lead">{service.description}</p></div></header>
    <section className="section"><div className="container story-layout"><div className="story-image"><Image src={service.image_url} alt={service.title} fill sizes="(max-width: 800px) 100vw, 50vw" unoptimized style={{objectFit:"cover"}}/></div>
    <div className="story-copy"><span className="eyebrow kicker">DESIGNED FOR YOU</span><h2 className="h2">A BETTER SPACE BEGINS WITH AN IDEA.</h2><p className="body-text" style={{whiteSpace:"pre-line"}}>{service.long_description || service.description}</p>{!!service.features?.length && <ul className="cms-public-features">{service.features.map(feature => <li key={feature}>{feature}</li>)}</ul>}<Link href="/contact" className="text-link" style={{marginTop:35}}>Discuss this service <ArrowUpRight size={18}/></Link></div></div></section>
    <SectionCTA/></>;
}

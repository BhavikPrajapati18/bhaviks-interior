import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Faq, Project, Service } from "@/lib/content/types";

export function ServiceCards({ services }: { services: Service[] }) {
  if (!services.length) return <p className="body-text">Services will appear here when published.</p>;
  return <div className="services-grid">{services.map(item => <Link href={`/services/${item.slug}`} className="service-tile" key={item.id}>
    <Image className="tile-media" src={item.image_url} alt={item.title} fill sizes="(max-width: 540px) 100vw, (max-width: 800px) 50vw, 33vw" unoptimized />
    <div className="tile-content"><span className="tile-category">{item.category}</span><div className="tile-row"><h3 className="h3">{item.title}</h3><span className="tile-arrow" aria-hidden><ArrowUpRight size={18}/></span></div></div>
  </Link>)}</div>;
}
export function ProjectCards({ projects }: { projects: Project[] }) {
  if (!projects.length) return <p className="body-text">Projects will appear here when published.</p>;
  return <div className="project-grid">{projects.map(project => <Link href={`/projects/${project.slug}`} className="project-card" key={project.id}>
    <div className="project-img"><Image className="tile-media" src={project.cover_image} alt={project.title} fill sizes="(max-width: 540px) 100vw, 50vw" unoptimized /></div>
    <div className="project-info"><div><h3>{project.title}</h3><p>{project.category} · {project.location}</p></div><ArrowUpRight size={19} aria-hidden/></div>
  </Link>)}</div>;
}
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return <div className="faq-list">{faqs.map(faq => <details key={faq.id} className="faq-item"><summary>{faq.question}<span aria-hidden><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg></span></summary><p>{faq.answer}</p></details>)}</div>;
}

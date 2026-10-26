import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getProjectBySlug } from "@/lib/content/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { SectionCTA } from "@/components/site/section-cta";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{slug: string}> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return project ? { title: project.meta_title || project.title, description: project.meta_description || project.description } : {};
}
export default async function ProjectDetail({ params }: { params: Promise<{slug: string}> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  return <><header className="page-header"><div className="container"><span className="eyebrow">{project.category} / {project.location}{project.project_year && ` / ${project.project_year}`}</span><h1 className="h1">{project.title}</h1><p className="page-lead">{project.description}</p></div></header>
    <section className="section"><div className="container"><div style={{position:"relative",aspectRatio:"16/9",background:"#a18c7f",overflow:"hidden"}}><Image src={project.cover_image} alt={project.title} fill sizes="100vw" unoptimized style={{objectFit:"cover"}}/></div>
      <div className="editorial-head" style={{marginTop:42}}><div><span className="eyebrow kicker">PROJECT OVERVIEW</span><h2 className="h2" style={{marginTop:15}}>{project.title}</h2></div><div><p className="body-text">{project.description}</p>{!isSupabaseConfigured() && <p className="preview-note" style={{marginTop:20}}>Design concept · Not a completed client project</p>}<Link href="/projects" className="text-link" style={{marginTop:25}}>All projects <ArrowUpRight size={16}/></Link></div></div>
      {!!project.gallery_images?.length && <div className="cms-project-gallery">{project.gallery_images.map((url, i) => <div className="cms-gallery-photo" key={`${url}-${i}`}><Image src={url} alt={`${project.title}, view ${i+1}`} fill unoptimized sizes="(max-width:720px) 100vw, 50vw" style={{objectFit:"cover"}} /></div>)}</div>}
    </div></section><SectionCTA/></>;
}

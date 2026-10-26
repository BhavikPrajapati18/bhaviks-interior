import type { Metadata } from "next";
import { ProjectCards } from "@/components/site/cards";
import { SectionCTA } from "@/components/site/section-cta";
import { getHomepageContent } from "@/lib/content/queries";
export const metadata: Metadata = { title: "Projects", description: "Explore spaces conceived with care and designed with purpose." };
export default async function ProjectsPage() {
  const { projects, demo, config } = await getHomepageContent();
  return <><header className="page-header"><div className="container"><span className="eyebrow">{config.projects_page_eyebrow}</span><h1 className="h1">{config.projects_page_heading}</h1><p className="page-lead">{config.projects_page_description}</p></div></header>
    <section className="section"><div className="container">{demo && <p className="preview-note">Concept studies used for preview. Replace with approved project photography and real details.</p>}<ProjectCards projects={projects}/></div></section><SectionCTA/></>;
}

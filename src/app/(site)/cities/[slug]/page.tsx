import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";
import { getCityContent, getCityPageBySlug } from "@/lib/cities";
import { ProjectCards, ServiceCards } from "@/components/site/cards";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{slug: string}> }): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityPageBySlug(slug);
  if (!city) return {};
  return {
    title: city.meta_title || `Interior Design in ${city.city_name}`,
    description: city.meta_description || city.hero_description,
    openGraph: {
      title: city.meta_title || `Interior Design in ${city.city_name}`,
      description: city.meta_description || city.hero_description,
      images: city.hero_image ? [{ url: city.hero_image, alt: city.hero_image_alt || city.city_name }] : undefined
    }
  };
}

export default async function CityDetailPage({ params }: { params: Promise<{slug: string}> }) {
  const { slug } = await params;
  const result = await getCityContent(slug);
  if (!result) notFound();
  const { city, services, projects } = result;
  return <>
    <header className={`city-hero${city.hero_image ? " has-photo" : ""}`}>
      {city.hero_image && <Image src={city.hero_image} alt={city.hero_image_alt} fill priority unoptimized sizes="100vw" className="city-hero-img"/>}
      <div className="container city-hero-inner"><Link href="/cities" className="city-breadcrumb">All locations / {city.city_name}</Link>
        <span className="eyebrow">{city.hero_eyebrow}</span><h1 className="h1">{city.hero_heading}</h1><p className="page-lead">{city.hero_description}</p>
        <Link className="btn btn-primary" href="/contact">Start your project <ArrowUpRight size={17}/></Link>
      </div>
    </header>
    {(city.intro_heading || city.intro_body || city.intro_image) && <section className="section city-story"><div className="container city-story-grid">
      <div><span className="kicker">{city.intro_eyebrow}</span>{city.intro_heading && <h2 className="h2">{city.intro_heading}</h2>}{city.intro_body && <p className="body-text city-story-text">{city.intro_body}</p>}</div>
      {city.intro_image && <div className="city-story-image"><Image src={city.intro_image} alt={city.intro_image_alt} fill unoptimized sizes="(max-width: 800px) 100vw, 50vw"/></div>}
    </div></section>}
    {services.length > 0 && <section className="section city-tint"><div className="container"><span className="kicker">WHAT WE OFFER</span><h2 className="h2 city-section-head">{city.services_heading}</h2><ServiceCards services={services}/></div></section>}
    {city.highlights?.length > 0 && <section className="section city-highlights"><div className="container"><span className="kicker">OUR COMMITMENT</span><h2 className="h2 city-section-head">{city.highlights_heading}</h2>
      <div className="city-benefit-grid">{city.highlights.map((item, index) => <article key={index}><span className="city-number">{String(index + 1).padStart(2,"0")}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div>
    </div></section>}
    {projects.length > 0 && <section className="section"><div className="container"><span className="kicker">SELECTED WORK</span><h2 className="h2 city-section-head">{city.projects_heading}</h2><ProjectCards projects={projects}/></div></section>}
    {city.testimonials?.length > 0 && <section className="section city-testimonials"><div className="container"><span className="kicker">IN THEIR WORDS</span><h2 className="h2 city-section-head">{city.testimonials_heading}</h2>
      <div className="city-quote-grid">{city.testimonials.map((item, index) => <blockquote key={index}><p>“{item.quote}”</p><footer>{item.name}{item.details && <span> / {item.details}</span>}</footer></blockquote>)}</div>
    </div></section>}
    {city.faqs?.length > 0 && <section className="section"><div className="container"><span className="kicker">GOOD TO KNOW</span><h2 className="h2 city-section-head">{city.faqs_heading}</h2>
      <div className="faq-list">{city.faqs.map((item, index) => <details className="faq-item" key={index}><summary>{item.question}<Plus size={22} aria-hidden/></summary><p>{item.answer}</p></details>)}</div>
    </div></section>}
    <section className="section dark-section city-cta"><div className="container"><span className="eyebrow">BEGIN HERE / {city.city_name}</span><h2 className="h2">{city.cta_heading}</h2>{city.cta_description && <p>{city.cta_description}</p>}
      <Link href="/contact" className="btn btn-primary">{city.cta_button_label} <ArrowUpRight size={17}/></Link>
    </div></section>
  </>;
}

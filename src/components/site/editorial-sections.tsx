import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import type { ShowcaseItem, TeamMember, Testimonial } from "@/lib/editorial";

export function TestimonialsSection({ reviews }: { reviews: Testimonial[] }) {
  if (!reviews.length) return null;
  return <section className="section exp-reviews" aria-labelledby="reviews-heading"><div className="container">
    <div className="exp-section-heading"><span className="eyebrow kicker">CLIENT STORIES</span><h2 id="reviews-heading" className="h2">WORDS FROM OUR CLIENTS.</h2></div>
    <div className="exp-quote-grid">{reviews.slice(0, 3).map(item => <figure className="exp-quote" key={item.id}>
      <div className="exp-stars" aria-label={`${item.rating} out of 5 stars`}>{"★".repeat(Math.max(1, Math.min(5, item.rating)))}</div>
      <blockquote>“{item.quote}”</blockquote><figcaption>{item.image_url && <Image className="exp-avatar" src={item.image_url} alt={`Image associated with ${item.client_name}'s review`} width={50} height={50} unoptimized />}<strong>{item.client_name}</strong>{item.client_location && <span>{item.client_location}</span>}{item.project_label && <small>{item.project_label}</small>}</figcaption>
    </figure>)}</div>
  </div></section>;
}

export function TeamSection({ members }: { members: TeamMember[] }) {
  if (!members.length) return null;
  return <section className="section exp-team" aria-labelledby="team-heading"><div className="container">
    <div className="exp-section-heading"><span className="eyebrow kicker">THE PEOPLE</span><h2 id="team-heading" className="h2">MEET THE STUDIO.</h2></div>
    <div className="exp-team-grid">{members.map(member => <article key={member.id} className="exp-team-card">
      {member.image_url && <div className="exp-team-photo"><Image src={member.image_url} alt={`Portrait of ${member.full_name}`} fill sizes="(max-width: 650px) 100vw, (max-width: 950px) 50vw, 33vw" unoptimized /></div>}
      <h3>{member.full_name}</h3><p className="exp-team-role">{member.job_title}</p>{member.biography && <p>{member.biography}</p>}
    </article>)}</div>
  </div></section>;
}

export function ShowcasePreview({ items }: { items: ShowcaseItem[] }) {
  const featured = items.filter(item => item.is_featured).slice(0, 3);
  if (!featured.length) return null;
  return <section className="section exp-showcase-section" aria-labelledby="showcase-heading"><div className="container">
    <div className="section-topline editorial-head"><div><span className="eyebrow kicker">MATERIAL & MOMENT</span><h2 id="showcase-heading" className="h2">INSIDE THE STUDIO.</h2></div><Link className="text-link" href="/gallery">View gallery <ArrowUpRight size={17}/></Link></div>
    <ShowcaseGrid items={featured}/>
  </div></section>;
}

export function ShowcaseGrid({ items }: { items: ShowcaseItem[] }) {
  return <div className="exp-gallery-grid">{items.map(item => <article key={item.id} className="exp-gallery-item">
    <div className="exp-gallery-image"><Image src={item.image_url} alt={item.image_alt || item.title} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" unoptimized />
      {item.media_kind === "video" && <span className="exp-video-tag"><Play size={15} fill="currentColor" aria-hidden/> Video</span>}</div>
    <div className="exp-gallery-meta"><small>{item.category}</small><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}
      {item.media_kind === "video" && <a href={item.video_url} target="_blank" rel="noopener noreferrer" className="text-link" aria-label={`Watch ${item.title} (opens in new tab)`}>Watch film <ArrowUpRight size={17}/></a>}
    </div>
  </article>)}</div>;
}

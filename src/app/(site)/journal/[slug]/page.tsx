import { canOptimizeImage } from "@/lib/image-source";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { absoluteUrl, pageMetadata, safeJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { ArrowUpRight } from "lucide-react";
import { getJournalPostBySlug, journalDate } from "@/lib/journal";
import { JournalContent } from "@/components/site/journal-content";
import { SectionCTA } from "@/components/site/section-cta";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) return { robots: { index: false } };
  return pageMetadata({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    path: `/journal/${encodeURIComponent(slug)}`,
    image: post.cover_image,
    imageAlt: post.cover_alt || post.title,
    type: "article",
    publishedTime: post.published_at,
  });
}
export default async function JournalDetail({ params }: { params: Promise<{slug:string}> }) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);
  if (!post) notFound();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    mainEntityOfPage: absoluteUrl(`/journal/${encodeURIComponent(slug)}`),
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author_name },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    ...(post.cover_image ? { image: post.cover_image } : {}),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }} /><article><header className="page-header journal-detail-header"><div className="container"><Link className="journal-back" href="/journal">← Back to Journal</Link>
    <span className="eyebrow">{post.category} / {journalDate(post.published_at)}</span><h1 className="h1">{post.title}</h1><p className="page-lead">{post.excerpt}</p>
    <p className="journal-byline">Words by {post.author_name}</p></div></header>
    {post.cover_image && <div className="container journal-hero-cover"><div className="journal-hero-photo"><Image src={post.cover_image} alt={post.cover_alt || post.title} fill unoptimized={!canOptimizeImage(post.cover_image)} priority sizes="100vw" style={{objectFit:"cover"}}/></div></div>}
    <section className="section"><div className="container"><div className="journal-copy"><JournalContent body={post.body}/>
      {post.tags.length > 0 && <div className="journal-tags" aria-label="Article topics">{post.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
      <Link href="/journal" className="text-link journal-all-link">All stories <ArrowUpRight size={17}/></Link></div></div></section>
    </article><SectionCTA/></>;
}

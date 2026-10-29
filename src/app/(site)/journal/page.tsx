import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getPublishedJournalPosts, journalDate } from "@/lib/journal";
import { SectionCTA } from "@/components/site/section-cta";
export const metadata: Metadata = {
  title: "Journal",
  description: "Stories, ideas and practical insight on interiors, thoughtful materials and considered living."
};
export const dynamic = "force-dynamic";
export default async function JournalPage() {
  const posts = await getPublishedJournalPosts(60);
  return <><header className="page-header"><div className="container"><span className="eyebrow">IDEAS & INSPIRATION</span>
    <h1 className="h1">THE DESIGN JOURNAL.</h1><p className="page-lead">Notes on meaningful spaces, quiet materials and the details that make a place feel like home.</p></div></header>
    <section className="section"><div className="container">
      {posts.length ? <div className="journal-grid">{posts.map(post => <Link href={`/journal/${post.slug}`} key={post.id} className="journal-card">
        <div className="journal-card-media">{post.cover_image ? <Image src={post.cover_image} alt={post.cover_alt || post.title} fill unoptimized sizes="(max-width: 750px) 100vw, (max-width: 1100px) 50vw, 33vw" style={{objectFit:"cover"}}/> : <span>BHAVIK&apos;S INTERIOR</span>}</div>
        <div className="journal-card-meta">{post.category} <span>—</span> {journalDate(post.published_at)}</div>
        <h2>{post.title}</h2><p>{post.excerpt}</p><span className="journal-read-link">Read story <ArrowUpRight size={16}/></span>
      </Link>)}</div> : <div className="journal-empty"><p>Our first journal stories are on their way.</p><Link href="/projects" className="text-link">Explore projects <ArrowUpRight size={16}/></Link></div>}
    </div></section><SectionCTA/></>;
}

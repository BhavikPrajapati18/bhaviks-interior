import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { getPublishedShowcase } from "@/lib/editorial";
import { ShowcaseGrid } from "@/components/site/editorial-sections";

export const metadata = pageMetadata({ title: 'Gallery', description: "Explore the photographic and video gallery of Bhavik's Interior.", path: '/gallery' });


export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const category = type === "videos" ? "videos" : type === "photos" ? "photos" : "all";
  const items = await getPublishedShowcase(100);
  const filtered = items.filter(item => category === "all" || (category === "videos" ? item.media_kind === "video" : item.media_kind === "image"));
  return <><header className="page-header"><div className="container"><span className="eyebrow">VISUAL JOURNAL</span><h1 className="h1">THE GALLERY.</h1><p className="page-lead">A collection of materials, spaces and ideas from the studio.</p></div></header>
    <section className="section"><div className="container"><nav className="exp-gallery-tabs" aria-label="Filter gallery">
      {[{slug:"all",name:"Everything",href:"/gallery"},{slug:"photos",name:"Photography",href:"/gallery?type=photos"},{slug:"videos",name:"Films",href:"/gallery?type=videos"}].map(tab => <Link key={tab.slug} href={tab.href} aria-current={category === tab.slug ? "page" : undefined}>{tab.name}</Link>)}
    </nav>{filtered.length ? <ShowcaseGrid items={filtered}/> : <p className="exp-empty">No published {category === "all" ? "gallery items" : category} yet. Check back soon.</p>}</div></section>
  </>;
}

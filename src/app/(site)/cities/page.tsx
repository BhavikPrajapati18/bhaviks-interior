import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getPublishedCities } from "@/lib/cities";

export const metadata: Metadata = {
  title: "Where We Work | Interior Design Cities",
  description: "Explore Bhavik's Interior design services and projects across our available cities."
};
export const dynamic = "force-dynamic";

export default async function CitiesIndexPage() {
  const cities = await getPublishedCities();
  return <><header className="page-header"><div className="container"><span className="eyebrow">OUR LOCATIONS</span>
    <h1 className="h1">PLACES WE DESIGN.</h1><p className="page-lead">Explore where we work, the spaces we shape, and the services available in each location.</p>
  </div></header>
    <section className="section"><div className="container">
      {cities.length ? <div className="cities-index-grid">{cities.map(city => <Link href={`/cities/${city.slug}`} className="cities-index-card" key={city.id}>
        <div className="cities-index-media">{city.hero_image ? <Image src={city.hero_image} alt={city.hero_image_alt || `Interior design in ${city.city_name}`} fill unoptimized sizes="(max-width: 720px) 100vw, 50vw"/> : <span>BHAVIK&apos;S INTERIOR</span>}</div>
        <div className="cities-index-title"><div><span>{city.region_name || "DESIGN LOCATION"}</span><h2>{city.city_name}</h2><p>{city.hero_description}</p></div><ArrowUpRight size={23} aria-hidden/></div>
      </Link>)}</div> : <div className="cities-index-empty"><h2>New locations coming soon.</h2><p>To discuss an interior project in your city, reach out to our team.</p><Link href="/contact" className="btn btn-primary">Enquire now <ArrowUpRight size={16}/></Link></div>}
    </div></section></>;
}

import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { requireEditor } from "@/lib/auth";

export default async function StudioCitiesPage() {
  const { supabase } = await requireEditor();
  const { data, error } = await supabase.from("city_pages").select("id,city_name,region_name,slug,is_published,updated_at")
    .order("city_name", { ascending: true });
  if (error) throw new Error("Could not load city pages. Apply migration 005 first.");
  return <><CmsHeading title="City pages" description="Publish location-specific stories, services, projects and FAQs." action={<Link className="btn btn-primary" href="/studio/cities/new">New city +</Link>}/>
    <div className="cms-surface"><div className="journal-table-head"><span>Location</span><span>Status</span><span>Updated</span><span></span></div>
      {data?.length ? data.map(city => <div key={city.id} className="journal-table-row">
        <div><strong>{city.city_name}{city.region_name ? `, ${city.region_name}` : ""}</strong><small>/cities/{city.slug}</small></div>
        <span className={city.is_published ? "cms-tag published" : "cms-tag"}>{city.is_published ? "Published" : "Draft"}</span>
        <span>{new Date(city.updated_at).toLocaleDateString("en-IN")}</span>
        <Link href={`/studio/cities/${city.id}`}>Edit ↗</Link>
      </div>) : <p className="cms-empty">No city pages yet. Add your first location.</p>}
    </div></>;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsHeading } from "@/components/studio/ui";
import { CityEditor } from "@/components/studio/city-editor";
import { requireEditor } from "@/lib/auth";
import type { CityPage } from "@/lib/cities";

export default async function EditCityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireEditor();
  const [city, services, projects] = await Promise.all([
    supabase.from("city_pages").select("*").eq("id", id).maybeSingle(),
    supabase.from("services").select("slug,title").order("title"),
    supabase.from("portfolio_projects").select("slug,title").order("title")
  ]);
  if (city.error || !city.data) notFound();
  if (services.error || projects.error) throw new Error("Could not load available services/projects.");
  return <><Link className="cms-back" href="/studio/cities">← Cities</Link>
    <CmsHeading title={`Edit ${city.data.city_name}`} description="Manage this city's page content and publication status."/>
    <CityEditor initial={city.data as CityPage} services={services.data ?? []} projects={projects.data ?? []}/></>;
}

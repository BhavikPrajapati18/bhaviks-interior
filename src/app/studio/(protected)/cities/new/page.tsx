import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { CityEditor } from "@/components/studio/city-editor";
import { requireEditor } from "@/lib/auth";

export default async function NewCityPage() {
  const { supabase } = await requireEditor();
  const [services, projects] = await Promise.all([
    supabase.from("services").select("slug,title").order("title"),
    supabase.from("portfolio_projects").select("slug,title").order("title")
  ]);
  if (services.error || projects.error) throw new Error("Could not load available services/projects.");
  return <><Link href="/studio/cities" className="cms-back">← Cities</Link>
    <CmsHeading title="New city page" description="Start with a draft, then publish after reviewing the content."/>
    <CityEditor services={services.data ?? []} projects={projects.data ?? []}/></>;
}

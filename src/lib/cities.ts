import type { Project, Service } from "@/lib/content/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CityHighlight = { title: string; description: string };
export type CityTestimonial = { quote: string; name: string; details: string };
export type CityFaq = { question: string; answer: string };

export type CityPage = {
  id: string;
  city_name: string;
  region_name: string;
  slug: string;
  display_order: number;
  is_published: boolean;
  hero_eyebrow: string;
  hero_heading: string;
  hero_description: string;
  hero_image: string;
  hero_image_alt: string;
  intro_eyebrow: string;
  intro_heading: string;
  intro_body: string;
  intro_image: string;
  intro_image_alt: string;
  services_heading: string;
  service_slugs: string[];
  highlights_heading: string;
  highlights: CityHighlight[];
  projects_heading: string;
  project_slugs: string[];
  testimonials_heading: string;
  testimonials: CityTestimonial[];
  faqs_heading: string;
  faqs: CityFaq[];
  cta_heading: string;
  cta_description: string;
  cta_button_label: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
};
export type CitySummary = Pick<CityPage, "id" | "city_name" | "region_name" | "slug" | "hero_image" | "hero_image_alt" | "hero_description">;

export async function getPublishedCities(): Promise<CitySummary[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("city_pages")
    .select("id,city_name,region_name,slug,hero_image,hero_image_alt,hero_description")
    .eq("is_published", true).order("display_order").order("city_name");
  if (error) throw new Error("Cannot load available locations. Check migration 005.");
  return (data ?? []) as CitySummary[];
}

export async function getCityPageBySlug(slug: string): Promise<CityPage | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("city_pages")
    .select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw new Error("Could not load location page.");
  return (data ?? null) as CityPage | null;
}

export async function getCityContent(slug: string): Promise<{
  city: CityPage;
  services: Service[];
  projects: Project[];
} | null> {
  const city = await getCityPageBySlug(slug);
  if (!city) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const serviceSlugs = city.service_slugs ?? [];
  const projectSlugs = city.project_slugs ?? [];
  const [servicesResult, projectsResult] = await Promise.all([
    serviceSlugs.length
      ? supabase.from("services").select("*").eq("is_published", true).in("slug", serviceSlugs)
      : Promise.resolve({ data: [], error: null }),
    projectSlugs.length
      ? supabase.from("portfolio_projects").select("*").eq("is_published", true).in("slug", projectSlugs)
      : Promise.resolve({ data: [], error: null })
  ]);
  if (servicesResult.error || projectsResult.error) throw new Error("Cannot load location services or projects.");
  const services = (servicesResult.data ?? []) as Service[];
  const projects = (projectsResult.data ?? []) as Project[];
  return {
    city,
    services: serviceSlugs.flatMap(s => services.filter(item => item.slug === s)),
    projects: projectSlugs.flatMap(s => projects.filter(item => item.slug === s))
  };
}

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sampleContent } from "./demo";
import type { Faq, ProcessStep, Project, Service, SiteConfig } from "./types";

/** The preview is deliberately independent of the old source database. */
export async function getHomepageContent() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ...sampleContent, demo: true };

  const [configResponse, servicesResponse, projectsResponse, faqsResponse, stepsResponse] = await Promise.all([
    supabase.from("site_config").select("*").eq("id", 1).single(),
    supabase.from("services").select("*").eq("is_published", true).order("display_order").order("title"),
    supabase.from("portfolio_projects").select("*").eq("is_published", true).order("display_order").order("title"),
    supabase.from("faqs").select("*").eq("is_published", true).order("display_order"),
    supabase.from("process_steps").select("*").eq("is_published", true).order("display_order")
  ]);
  const failed = [configResponse, servicesResponse, projectsResponse, faqsResponse, stepsResponse].find(result => result.error);
  if (failed?.error) throw new Error(`Published content unavailable: ${failed.error.message}. Run Phase 2 migration in your new database.`);
  return {
    config: configResponse.data as SiteConfig,
    services: servicesResponse.data as Service[],
    projects: projectsResponse.data as Project[],
    faqs: faqsResponse.data as Faq[],
    process: stepsResponse.data as ProcessStep[],
    demo: false
  };
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return sampleContent.services.find(service => service.slug === slug) || null;
  const { data, error } = await supabase.from("services").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw new Error("Failed to load service.");
  return data as Service | null;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return sampleContent.projects.find(project => project.slug === slug) || null;
  const { data, error } = await supabase.from("portfolio_projects").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw new Error("Failed to load project.");
  return data as Project | null;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return sampleContent.config;
  const { data, error } = await supabase.from("site_config").select("*").eq("id", 1).single();
  if (error || !data) throw new Error("Site configuration unavailable. Apply the Phase 2 database migration.");
  return data as SiteConfig;
}

export async function getFooterServices(): Promise<{ title: string; slug: string }[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return sampleContent.services.map(({title, slug}) => ({title,slug}));
  const {data,error} = await supabase.from("services").select("title,slug").eq("is_published",true).order("display_order").limit(5);
  if (error) throw new Error("Unable to load navigation services");
  return data || [];
}

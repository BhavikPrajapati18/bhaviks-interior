import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Testimonial = {
  id: string; client_name: string; client_location: string; project_label: string;
  quote: string; rating: number; image_url: string; is_published: boolean; display_order: number;
};
export type TeamMember = {
  id: string; full_name: string; job_title: string; biography: string;
  image_url: string; is_published: boolean; display_order: number;
};
export type ShowcaseItem = {
  id: string; title: string; category: string; description: string;
  media_kind: "image" | "video"; image_url: string; image_alt: string;
  video_url: string; is_featured: boolean; is_published: boolean; display_order: number;
};

// No fabricated testimonials/staff: empty database collections render no section.
async function published<T>(table: "site_testimonials" | "site_team_members" | "site_showcase_media", limit?: number): Promise<T[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase.from(table).select("*").eq("is_published", true).order("display_order", { ascending: true }).order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw new Error(`Unable to load ${table} content`);
  return (data ?? []) as T[];
}
export const getPublishedTestimonials = (limit?: number) => published<Testimonial>("site_testimonials", limit);
export const getPublishedTeam = (limit?: number) => published<TeamMember>("site_team_members", limit);
export const getPublishedShowcase = (limit?: number) => published<ShowcaseItem>("site_showcase_media", limit);

export async function getFeaturedShowcase(): Promise<ShowcaseItem[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("site_showcase_media").select("*")
    .eq("is_published", true).eq("is_featured", true)
    .order("display_order", { ascending: true }).limit(3);
  if (error) throw new Error("Unable to load featured showcase");
  return (data ?? []) as ShowcaseItem[];
}

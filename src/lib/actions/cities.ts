"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireEditor } from "@/lib/auth";
import type { CityFaq, CityHighlight, CityTestimonial } from "@/lib/cities";

type CityActionState = { error: string; message: string };
const fail = (error: string): CityActionState => ({ error, message: "" });
const field = (max: number) => z.string().trim().max(max);
const slugSchema = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens for the URL.");
const schema = z.object({
  city_name: z.string().trim().min(2).max(90),
  region_name: field(120),
  slug: slugSchema,
  display_order: z.coerce.number().int().min(0).max(100000),
  hero_eyebrow: field(100),
  hero_heading: field(180),
  hero_description: field(900),
  hero_image: field(2048),
  hero_image_alt: field(240),
  intro_eyebrow: field(100),
  intro_heading: field(180),
  intro_body: field(5000),
  intro_image: field(2048),
  intro_image_alt: field(240),
  services_heading: field(150),
  highlights_heading: field(150),
  projects_heading: field(150),
  testimonials_heading: field(150),
  faqs_heading: field(150),
  cta_heading: field(180),
  cta_description: field(500),
  cta_button_label: field(80),
  meta_title: field(180),
  meta_description: field(300),
  is_published: z.enum(["true", "false"])
});

function listOf<T>(form: FormData, name: string, keys: (keyof T)[], maxCount: number, maxField = 700): T[] {
  const raw = String(form.get(name) ?? "[]");
  if (raw.length > maxCount * (maxField * keys.length + 20)) throw new Error(`${name}: content too long.`);
  let decoded: unknown;
  try { decoded = JSON.parse(raw); } catch { throw new Error(`${name}: invalid content.`); }
  if (!Array.isArray(decoded) || decoded.length > maxCount) throw new Error(`${name}: too many items.`);
  return decoded.map(row => {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error(`${name}: invalid item.`);
    const result: Record<string, string> = {};
    for (const key of keys) {
      const value = (row as Record<string, unknown>)[String(key)];
      if (typeof value !== "string" || value.trim().length > maxField) throw new Error(`${name}: invalid field.`);
      result[String(key)] = value.trim();
    }
    return result as unknown as T;
  }).filter(row => keys.some(key => Boolean(row[key])));
}

function selectedSlugs(form: FormData, name: string): string[] {
  const selected = form.getAll(name).map(value => String(value));
  if (selected.length > 30 || selected.some(value => !slugSchema.safeParse(value).success)) throw new Error(`Invalid ${name} selection.`);
  return [...new Set(selected)];
}

export async function saveCityPage(_old: CityActionState, form: FormData): Promise<CityActionState> {
  const { supabase } = await requireEditor();
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check location details.");
  const data = parsed.data;
  const rawId = String(form.get("id") ?? "");
  if (rawId && !z.uuid().safeParse(rawId).success) return fail("Invalid city ID.");
  const published = data.is_published === "true";
  if (published && (data.hero_heading.length < 8 || data.hero_description.length < 20)) return fail("A published city needs a hero heading (8+ characters) and description (20+ characters).");
  if (published && data.hero_image && data.hero_image_alt.length < 4) return fail("Please add hero image alt text.");
  if (published && data.intro_image && data.intro_image_alt.length < 4) return fail("Please add introduction image alt text.");
  let highlights: CityHighlight[], testimonials: CityTestimonial[], faqs: CityFaq[], service_slugs: string[], project_slugs: string[];
  try {
    highlights = listOf<CityHighlight>(form, "highlights", ["title", "description"], 8);
    testimonials = listOf<CityTestimonial>(form, "testimonials", ["quote", "name", "details"], 8);
    faqs = listOf<CityFaq>(form, "faqs", ["question", "answer"], 20);
    service_slugs = selectedSlugs(form, "service_slugs");
    project_slugs = selectedSlugs(form, "project_slugs");
  } catch (e) { return fail(e instanceof Error ? e.message : "Invalid sections."); }
  for (const item of highlights) if (!item.title || !item.description) return fail("Each benefit needs a title and description.");
  for (const item of testimonials) if (!item.quote || !item.name) return fail("Each testimonial needs a quote and customer name.");
  for (const item of faqs) if (!item.question || !item.answer) return fail("Each FAQ needs a question and answer.");
  // Validate selected slugs against content this editor can view; published site independently filters drafts.
  const [serviceResult, projectResult] = await Promise.all([
    supabase.from("services").select("slug").in("slug", service_slugs.length ? service_slugs : ["__none__"]),
    supabase.from("portfolio_projects").select("slug").in("slug", project_slugs.length ? project_slugs : ["__none__"])
  ]);
  if (serviceResult.error || projectResult.error) return fail("Could not verify selected services and projects.");
  if (serviceResult.data?.length !== service_slugs.length || projectResult.data?.length !== project_slugs.length) return fail("A selected service or project is no longer available.");

  const record = {
    ...data,
    is_published: published,
    service_slugs,
    project_slugs,
    highlights,
    testimonials,
    faqs
  };
  let previousSlug = "";
  if (rawId) {
    const { data: previous, error } = await supabase.from("city_pages").select("slug").eq("id", rawId).maybeSingle();
    if (error || !previous) return fail("City page not found.");
    previousSlug = previous.slug;
  }
  const result = rawId
    ? await supabase.from("city_pages").update(record).eq("id", rawId).select("id").single()
    : await supabase.from("city_pages").insert(record).select("id").single();
  if (result.error || !result.data) return fail(result.error?.code === "23505" ? "This city URL slug already exists." : result.error?.message ?? "Unable to save city page.");
  revalidatePath("/cities");
  revalidatePath("/studio/cities");
  revalidatePath(`/cities/${data.slug}`);
  if (previousSlug && previousSlug !== data.slug) revalidatePath(`/cities/${previousSlug}`);
  if (!rawId) redirect(`/studio/cities/${result.data.id}`);
  return { error: "", message: published ? "City page published." : "Draft saved." };
}

export async function deleteCityPage(form: FormData): Promise<void> {
  const { supabase } = await requireEditor();
  const id = z.uuid().parse(form.get("id"));
  const { data, error: readError } = await supabase.from("city_pages").select("slug").eq("id", id).maybeSingle();
  if (readError || !data) throw new Error("City page does not exist.");
  const { error } = await supabase.from("city_pages").delete().eq("id", id);
  if (error) throw new Error("Unable to delete city page.");
  revalidatePath("/cities");
  revalidatePath(`/cities/${data.slug}`);
  revalidatePath("/studio/cities");
  redirect("/studio/cities");
}

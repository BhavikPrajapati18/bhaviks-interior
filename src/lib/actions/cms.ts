"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireEditor } from "@/lib/auth";

export type FormStatus = { message: string; error: string };
const ok = (message: string): FormStatus => ({ message, error: "" });
const fail = (error: string): FormStatus => ({ message: "", error });

const httpsImage = z.string().trim().min(1).max(2048).refine(
  value => (value.startsWith("/") && !value.startsWith("//")) || /^https:\/\/[^\s]+$/i.test(value),
  "Please provide an HTTPS image URL or /public/path."
);
const optionalHttpsImage = z.union([httpsImage, z.literal("")]);
const short = z.string().trim().min(2).max(120);
const paragraph = z.string().trim().min(5).max(2000);
const optionalText = z.string().trim().max(300);
const sort = z.coerce.number<number>().int().min(0).max(100000);
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens").max(100);
const uuid = z.uuid();

const settingsSchema = z.object({
  hero_eyebrow: short, hero_heading: paragraph.max(160), hero_description: paragraph,
  hero_image: httpsImage,
  introduction_eyebrow: short, introduction_heading: paragraph.max(160), introduction_body: paragraph,
  story_image: httpsImage, cta_image: httpsImage,
  about_page_eyebrow: short, about_page_heading: paragraph.max(160), about_page_description: paragraph,
  services_page_eyebrow: short, services_page_heading: paragraph.max(160), services_page_description: paragraph,
  projects_page_eyebrow: short, projects_page_heading: paragraph.max(160), projects_page_description: paragraph,
  contact_page_eyebrow: short, contact_page_heading: paragraph.max(160), contact_page_description: paragraph,
  services_eyebrow: short, services_heading: paragraph.max(160), services_description: paragraph,
  projects_eyebrow: short, projects_heading: paragraph.max(160), projects_description: paragraph,
  process_eyebrow: short, process_heading: paragraph.max(160), process_description: paragraph,
  faq_eyebrow: short, faq_heading: paragraph.max(160), faq_description: paragraph,
  cta_heading: paragraph.max(160), cta_description: paragraph,
  contact_email: z.union([z.email().max(250), z.literal("")]),
  contact_phone: optionalText,
  seo_title: short.max(160), seo_description: paragraph.max(300)
});

export async function saveSiteSettings(_state: FormStatus, data: FormData): Promise<FormStatus> {
  const { supabase } = await requireEditor();
  const parsed = settingsSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid settings");
  const { data: saved, error } = await supabase.from("site_config").update(parsed.data).eq("id", 1).select("id").single();
  if (error || !saved) return fail(error?.message || "Settings could not be saved");
  ["/", "/about", "/contact", "/services", "/projects", "/studio/settings"].forEach(path => revalidatePath(path));
  return ok("Website settings saved and published.");
}

const serviceSchema = z.object({
  slug, title: short, description: paragraph, category: short,
  image_url: httpsImage, long_description: z.string().trim().max(10000),
  meta_title: optionalText, meta_description: z.string().trim().max(350),
  display_order: sort,
  features: z.string().max(5000)
});

export async function upsertService(_state: FormStatus, data: FormData): Promise<FormStatus> {
  const { supabase } = await requireEditor();
  const parsed = serviceSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid service data");
  const id = String(data.get("id") || "");
  if (id && !uuid.safeParse(id).success) return fail("Invalid service identifier");
  const features = parsed.data.features.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (features.length > 20) return fail("Maximum 20 features");
  const { features: _text, ...values } = parsed.data;
  void _text;
  const record = { ...values, features, is_published: data.get("is_published") === "on" };
  if (id) {
    const { data: saved, error } = await supabase.from("services").update(record).eq("id", id).select("id").single();
    if (error || !saved) return fail(error?.code === "23505" ? "This service slug is already in use." : (error?.message || "Unable to update service"));
    revalidatePath("/services"); revalidatePath("/"); revalidatePath("/services/[slug]", "page"); revalidatePath("/studio/services");
    return ok("Service saved successfully.");
  }
  const { data: saved, error } = await supabase.from("services").insert(record).select("id").single();
  if (error || !saved) return fail(error?.code === "23505" ? "This service slug is already in use." : (error?.message || "Unable to create service"));
  revalidatePath("/services"); revalidatePath("/"); revalidatePath("/studio/services");
  redirect(`/studio/services/${saved.id}`);
}

export async function deleteService(data: FormData) {
  const { supabase } = await requireEditor();
  const id = uuid.parse(data.get("id"));
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error("Unable to delete service");
  revalidatePath("/services"); revalidatePath("/"); revalidatePath("/services/[slug]", "page"); revalidatePath("/studio/services");
  redirect("/studio/services");
}

const projectSchema = z.object({
  slug, title: short, category: short, location: z.string().trim().max(160),
  description: paragraph, cover_image: httpsImage,
  project_year: z.string().trim().max(25),
  meta_title: optionalText, meta_description: z.string().trim().max(350),
  gallery_images: z.string().max(10000),
  display_order: sort
});
export async function upsertProject(_state: FormStatus, data: FormData): Promise<FormStatus> {
  const { supabase } = await requireEditor();
  const parsed = projectSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid project data");
  const id = String(data.get("id") || "");
  if (id && !uuid.safeParse(id).success) return fail("Invalid project identifier");
  const gallery = parsed.data.gallery_images.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (gallery.length > 24 || !gallery.every(value => optionalHttpsImage.safeParse(value).success)) return fail("Gallery requires up to 24 valid HTTPS or relative URLs");
  const { gallery_images: _text, ...values } = parsed.data;
  void _text;
  const record = { ...values, gallery_images: gallery, is_published: data.get("is_published") === "on" };
  if (id) {
    const { data: saved, error } = await supabase.from("portfolio_projects").update(record).eq("id", id).select("id").single();
    if (error || !saved) return fail(error?.code === "23505" ? "Project slug already exists." : (error?.message || "Unable to update project"));
    revalidatePath("/projects"); revalidatePath("/"); revalidatePath("/projects/[slug]", "page"); revalidatePath("/studio/projects");
    return ok("Project saved successfully.");
  }
  const { data: saved, error } = await supabase.from("portfolio_projects").insert(record).select("id").single();
  if (error || !saved) return fail(error?.code === "23505" ? "Project slug already exists." : (error?.message || "Unable to create project"));
  revalidatePath("/projects"); revalidatePath("/"); revalidatePath("/studio/projects");
  redirect(`/studio/projects/${saved.id}`);
}
export async function deleteProject(data: FormData) {
  const { supabase } = await requireEditor();
  const id = uuid.parse(data.get("id"));
  const { error } = await supabase.from("portfolio_projects").delete().eq("id", id);
  if (error) throw new Error("Unable to delete project");
  revalidatePath("/projects"); revalidatePath("/"); revalidatePath("/projects/[slug]", "page"); revalidatePath("/studio/projects");
  redirect("/studio/projects");
}

const faqSchema = z.object({ question: short.max(300), answer: paragraph, display_order: sort });
export async function upsertFaq(_state: FormStatus, data: FormData): Promise<FormStatus> {
  const { supabase } = await requireEditor();
  const parsed = faqSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid FAQ");
  const id = String(data.get("id") || "");
  if (id && !uuid.safeParse(id).success) return fail("Invalid FAQ identifier");
  const record = { ...parsed.data, is_published: data.get("is_published") === "on" };
  if (id) {
    const { data: saved, error } = await supabase.from("faqs").update(record).eq("id", id).select("id").single();
    if (error || !saved) return fail(error?.message || "Unable to update FAQ");
    revalidatePath("/"); revalidatePath("/studio/faqs");
    return ok("FAQ saved.");
  }
  const { data: saved, error } = await supabase.from("faqs").insert(record).select("id").single();
  if (error || !saved) return fail(error?.message || "Unable to create FAQ");
  revalidatePath("/"); revalidatePath("/studio/faqs");
  redirect(`/studio/faqs/${saved.id}`);
}
export async function deleteFaq(data: FormData) {
  const { supabase } = await requireEditor();
  const id = uuid.parse(data.get("id"));
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) throw new Error("Unable to delete FAQ");
  revalidatePath("/"); revalidatePath("/studio/faqs");
  redirect("/studio/faqs");
}

const processSchema = z.object({ title: short, description: paragraph, display_order: sort });
export async function upsertProcess(_state: FormStatus, data: FormData): Promise<FormStatus> {
  const { supabase } = await requireEditor();
  const parsed = processSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid step");
  const id = String(data.get("id") || "");
  if (id && !uuid.safeParse(id).success) return fail("Invalid step identifier");
  const record = { ...parsed.data, is_published: data.get("is_published") === "on" };
  if (id) {
    const { data: saved, error } = await supabase.from("process_steps").update(record).eq("id", id).select("id").single();
    if (error || !saved) return fail(error?.message || "Unable to update step");
    revalidatePath("/"); revalidatePath("/studio/process");
    return ok("Process step saved.");
  }
  const { data: saved, error } = await supabase.from("process_steps").insert(record).select("id").single();
  if (error || !saved) return fail(error?.message || "Unable to create step");
  revalidatePath("/"); revalidatePath("/studio/process");
  redirect(`/studio/process/${saved.id}`);
}
export async function deleteProcess(data: FormData) {
  const { supabase } = await requireEditor();
  const id = uuid.parse(data.get("id"));
  const { error } = await supabase.from("process_steps").delete().eq("id", id);
  if (error) throw new Error("Unable to delete step");
  revalidatePath("/"); revalidatePath("/studio/process");
  redirect("/studio/process");
}

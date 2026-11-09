"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireEditor } from "@/lib/auth";

type Collection = "testimonials" | "team" | "showcase";
export type EditorialActionStatus = { error: string; message: string };
const tableMap = {
  testimonials: "site_testimonials",
  team: "site_team_members",
  showcase: "site_showcase_media"
} as const;
const validImage = z.union([
  z.literal(""),
  z.string().trim().max(2048).refine(v => /^https:\/\/[^\s]+$/i.test(v) || (v.startsWith("/") && !v.startsWith("//")), "Use an HTTPS image URL")
]);
const order = z.coerce.number<number>().int().min(0).max(100000);
const testimonialSchema = z.object({
  client_name: z.string().trim().min(2).max(120), client_location: z.string().trim().max(160),
  project_label: z.string().trim().max(160), quote: z.string().trim().min(10).max(2000),
  rating: z.coerce.number<number>().int().min(1).max(5), image_url: validImage, display_order: order
});
const teamSchema = z.object({
  full_name: z.string().trim().min(2).max(120), job_title: z.string().trim().min(2).max(120),
  biography: z.string().trim().max(2500), image_url: validImage, display_order: order
});
const showcaseSchema = z.object({
  title: z.string().trim().min(2).max(160), category: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1600), media_kind: z.enum(["image", "video"]),
  image_url: validImage, image_alt: z.string().trim().max(240),
  video_url: z.string().trim().max(2048), display_order: order
});
const uuid = z.uuid();

function validatedVideoURL(value: string): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password) return false;
    const host = u.hostname.toLowerCase();
    const matches = (...domains: string[]) => domains.some(domain => host === domain || host.endsWith(`.${domain}`));
    return matches("youtube.com", "youtu.be", "vimeo.com") || /\.(mp4|webm|ogg)$/i.test(u.pathname);
  } catch { return false; }
}

function paths(collection: Collection) {
  const page = `/studio/${collection}`;
  [page, "/", "/about", "/gallery"].forEach(path => revalidatePath(path));
}

export async function saveEditorial(collection: Collection, _previous: EditorialActionStatus, formData: FormData): Promise<EditorialActionStatus> {
  if (!(collection in tableMap)) return { error: "Unknown content collection", message: "" };
  const { supabase } = await requireEditor();
  const raw = Object.fromEntries(formData.entries());
  const parsed = collection === "testimonials" ? testimonialSchema.safeParse(raw)
    : collection === "team" ? teamSchema.safeParse(raw) : showcaseSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid content", message: "" };
  const id = String(formData.get("id") || "");
  if (id && !uuid.safeParse(id).success) return { error: "Invalid record ID", message: "" };
  const is_published = formData.get("is_published") === "on";
  const record: Record<string, unknown> = { ...parsed.data, is_published };
  if (collection === "showcase") {
    const item = parsed.data as z.infer<typeof showcaseSchema>;
    record.is_featured = formData.get("is_featured") === "on";
    record.video_url = item.media_kind === "video" ? item.video_url : "";
    if (item.media_kind === "video" && item.video_url && !validatedVideoURL(item.video_url))
      return { error: "Use an HTTPS YouTube, Vimeo or direct MP4/WebM video URL", message: "" };
    if (is_published && (!item.image_url || !item.image_alt || (item.media_kind === "video" && !item.video_url)))
      return { error: "Published media needs an image, accessible alt text and (for videos) a video link", message: "" };
  }
  const table = tableMap[collection];
  let savedId = id;
  if (id) {
    const { data, error } = await supabase.from(table).update(record).eq("id", id).select("id").maybeSingle();
    if (error || !data) return { error: error?.message ?? "Unable to update record", message: "" };
  } else {
    const { data, error } = await supabase.from(table).insert(record).select("id").single();
    if (error || !data) return { error: error?.message ?? "Unable to create record", message: "" };
    savedId = data.id;
  }
  paths(collection);
  if (!id) redirect(`/studio/${collection}/${savedId}`);
  return { error: "", message: "Changes saved." };
}

export async function deleteEditorial(collection: Collection, formData: FormData): Promise<void> {
  if (!(collection in tableMap)) throw new Error("Unknown content collection");
  const { supabase } = await requireEditor();
  const id = uuid.parse(formData.get("id"));
  const { error } = await supabase.from(tableMap[collection]).delete().eq("id", id);
  if (error) throw new Error("Unable to delete record");
  paths(collection);
  redirect(`/studio/${collection}`);
}

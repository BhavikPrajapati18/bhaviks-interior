"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireEditor } from "@/lib/auth";

type JournalFormState = { error: string; message: string };
const fail = (error: string): JournalFormState => ({ error, message: "" });
const slug = z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers and hyphens.");
const stringField = (max: number) => z.string().trim().max(max);
const journalSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug,
  excerpt: stringField(600),
  body: stringField(40000),
  author_name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(80),
  tags: stringField(500),
  cover_image: stringField(2048),
  cover_alt: stringField(240),
  meta_title: stringField(180),
  meta_description: stringField(300),
  is_published: z.enum(["true", "false"])
});

export async function saveJournalPost(_previous: JournalFormState, form: FormData): Promise<JournalFormState> {
  const { supabase } = await requireEditor();
  const parsed = journalSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Please review the article fields.");
  const rawId = String(form.get("id") || "");
  if (rawId && !z.uuid().safeParse(rawId).success) return fail("Invalid article ID.");
  const data = parsed.data;
  const publish = data.is_published === "true";
  if (publish && (data.body.length < 50 || data.excerpt.length < 20))
    return fail("Published articles need at least 50 characters of body text and a 20-character excerpt.");
  if (publish && data.cover_image && !data.cover_alt)
    return fail("Add descriptive alternative text for the cover image.");
  const tags = [...new Set(data.tags.split(",").map(t => t.trim()).filter(Boolean))].slice(0, 12);
  if (tags.some(t => t.length > 40)) return fail("Each tag must be 40 characters or fewer.");
  let publishedAt: string | null = null;
  if (rawId) {
    const { data: existing, error } = await supabase.from("journal_posts")
      .select("id,is_published,published_at,slug").eq("id", rawId).maybeSingle();
    if (error || !existing) return fail("Article not found.");
    // Republishing a draft keeps its previous publication date when available.
    publishedAt = publish ? existing.published_at || new Date().toISOString() : null;
    // Revalidate old permalink if editor changed slug.
    revalidatePath(`/journal/${existing.slug}`);
  } else if (publish) publishedAt = new Date().toISOString();
  const record = {
    title: data.title, slug: data.slug, excerpt: data.excerpt, body: data.body,
    author_name: data.author_name, category: data.category, tags,
    cover_image: data.cover_image, cover_alt: data.cover_alt,
    meta_title: data.meta_title, meta_description: data.meta_description,
    is_published: publish, published_at: publishedAt
  };
  const result = rawId
    ? await supabase.from("journal_posts").update(record).eq("id", rawId).select("id").single()
    : await supabase.from("journal_posts").insert(record).select("id").single();
  if (result.error || !result.data) {
    if (result.error?.code === "23505") return fail("This URL slug is already in use.");
    return fail(result.error?.message || "Could not save article.");
  }
  revalidatePath("/studio/journal");
  revalidatePath("/journal");
  revalidatePath(`/journal/${data.slug}`);
  if (!rawId) redirect(`/studio/journal/${result.data.id}`);
  return { error: "", message: publish ? "Article published successfully." : "Draft saved successfully." };
}

export async function deleteJournalPost(form: FormData): Promise<void> {
  const { supabase } = await requireEditor();
  const id = z.uuid().parse(form.get("id"));
  const { data: existing, error: readError } = await supabase.from("journal_posts")
    .select("slug").eq("id", id).maybeSingle();
  if (readError || !existing) throw new Error("Article not found.");
  const { error } = await supabase.from("journal_posts").delete().eq("id", id);
  if (error) throw new Error("Unable to delete article.");
  revalidatePath("/studio/journal");
  revalidatePath("/journal");
  revalidatePath(`/journal/${existing.slug}`);
  redirect("/studio/journal");
}

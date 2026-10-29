import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type JournalPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author_name: string;
  category: string;
  tags: string[];
  cover_image: string;
  cover_alt: string;
  meta_title: string;
  meta_description: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** RLS filters drafts out for anonymous visitors; explicit filters are defense in depth. */
export async function getPublishedJournalPosts(limit = 24): Promise<JournalPost[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("journal_posts").select("*")
    .eq("is_published", true).lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false }).limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw new Error("Could not load journal entries.");
  return (data || []) as JournalPost[];
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("journal_posts").select("*")
    .eq("slug", slug).eq("is_published", true)
    .lte("published_at", new Date().toISOString()).maybeSingle();
  if (error) throw new Error("Could not load journal entry.");
  return (data ?? null) as JournalPost | null;
}

export function journalDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { isPublicSite } from "@/lib/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteRow = { slug: string; updated_at?: string | null };

async function publishedRows(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  table: "services" | "portfolio_projects" | "city_pages" | "journal_posts"
): Promise<RouteRow[]> {
  const all: RouteRow[] = [];
  const pageSize = 500;
  // Supabase queries return at most the server's configured row limit. Paginate.
  for (let offset = 0; offset < 10000; offset += pageSize) {
    let query = supabase.from(table)
      .select("slug,updated_at")
      .eq("is_published", true)
      .order("slug", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (table === "journal_posts") query = query.lte("published_at", new Date().toISOString());
    const { data, error } = await query;
    if (error) throw new Error(`Sitemap content unavailable (${table}): ${error.message}`);
    const rows = (data ?? []) as RouteRow[];
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isPublicSite) return [];
  const paths = ["/", "/about", "/services", "/projects", "/cities", "/journal", "/gallery", "/contact"];
  const staticEntries: MetadataRoute.Sitemap = paths.map(path => ({ url: absoluteUrl(path), changeFrequency: path === "/" ? "weekly" : "monthly", priority: path === "/" ? 1 : 0.7 }));
  const supabase = await createSupabaseServerClient();
  if (!supabase) return staticEntries;

  const sources = [
    ["services", "/services/"],
    ["portfolio_projects", "/projects/"],
    ["city_pages", "/cities/"],
    ["journal_posts", "/journal/"]
  ] as const;
  const dynamicEntries: MetadataRoute.Sitemap = [];
  for (const [table, prefix] of sources) {
    for (const row of await publishedRows(supabase, table)) {
      if (!row.slug) continue;
      const date = row.updated_at ? new Date(row.updated_at) : null;
      dynamicEntries.push({
        url: absoluteUrl(prefix + encodeURIComponent(row.slug)),
        ...(date && !Number.isNaN(date.getTime()) ? { lastModified: date } : {}),
        changeFrequency: table === "journal_posts" ? "weekly" : "monthly",
        priority: 0.6,
      });
    }
  }
  return [...staticEntries, ...dynamicEntries];
}

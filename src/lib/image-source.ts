/**
 * Only use the Next.js image optimizer for configured, trusted image hosts.
 * Existing CMS links to other hosts remain supported via unoptimized passthrough.
 */
export function canOptimizeImage(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return !src.startsWith("//");
  try {
    const url = new URL(src);
    if (url.protocol !== "https:") return false;
    if (url.hostname === "images.unsplash.com" || url.hostname === "res.cloudinary.com") return true;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return false;
    const storageHost = new URL(supabaseUrl).hostname;
    return url.hostname === storageHost && url.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return false;
  }
}

import type { MetadataRoute } from "next";
import { isPublicSite, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isPublicSite) {
    // Development URLs must not be crawled. Configure NEXT_PUBLIC_SITE_URL before launch.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/studio/", "/client/", "/api/"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

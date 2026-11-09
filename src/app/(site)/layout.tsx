import { SiteHeader } from "@/components/site/site-header";
import { safeJsonLd } from "@/lib/seo";
import { site, isPublicSite } from "@/lib/site";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteConfig, getFooterServices } from "@/lib/content/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
export default async function SiteLayout({children}: { children: React.ReactNode }) {
  const [config, services] = await Promise.all([getSiteConfig(), getFooterServices()]);
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name, url: site.url },
    { "@type": "WebSite", "@id": `${site.url}/#website`, name: site.name, url: site.url, publisher: { "@id": `${site.url}/#organization` } }
  ] };
  return <><a className="skip-to-content" href="#main-content">Skip to content</a>{isPublicSite && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />}<SiteHeader/><main id="main-content" tabIndex={-1}>{children}</main><SiteFooter demo={!isSupabaseConfigured()} email={config.contact_email} phone={config.contact_phone} services={services}/></>;
}

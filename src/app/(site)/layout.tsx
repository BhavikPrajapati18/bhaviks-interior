import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteConfig, getFooterServices } from "@/lib/content/queries";
import { isSupabaseConfigured } from "@/lib/supabase/server";
export default async function SiteLayout({children}: { children: React.ReactNode }) {
  const [config, services] = await Promise.all([getSiteConfig(), getFooterServices()]);
  return <><SiteHeader/><main>{children}</main><SiteFooter demo={!isSupabaseConfigured()} email={config.contact_email} phone={config.contact_phone} services={services}/></>;
}

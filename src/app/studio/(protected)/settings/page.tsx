import { SettingsEditor } from "@/components/studio/settings-editor";
import { CmsHeading } from "@/components/studio/ui";
import { requireEditor } from "@/lib/auth";
import type { SiteConfig } from "@/lib/content/types";
export default async function SettingsPage() {
  const { supabase } = await requireEditor();
  const { data, error } = await supabase.from("site_config").select("*").eq("id", 1).single();
  if (error || !data) throw new Error("Unable to load site settings. Check migration 002.");
  return <><CmsHeading title="Site settings" description="Manage homepage headings, story, section text, public contact details and SEO metadata." />
    <SettingsEditor config={data as SiteConfig}/></>;
}

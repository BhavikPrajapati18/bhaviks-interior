import Link from "next/link";
import { requireEditor } from "@/lib/auth";
import { CmsHeading } from "@/components/studio/ui";

export default async function StudioOverview() {
  const { supabase } = await requireEditor();
  const [services, projects, faqs, steps, cities] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("portfolio_projects").select("id", { count: "exact", head: true }),
    supabase.from("faqs").select("id", { count: "exact", head: true }),
    supabase.from("process_steps").select("id", { count: "exact", head: true }),
    supabase.from("city_pages").select("id", { count: "exact", head: true })
  ]);
  const cards = [
    { label: "Services", count: services.count, href: "/studio/services", description: "List, edit and publish your services" },
    { label: "Projects", count: projects.count, href: "/studio/projects", description: "Portfolio projects, images and case studies" },
    { label: "FAQs", count: faqs.count, href: "/studio/faqs", description: "Frequently asked questions" },
    { label: "Process steps", count: steps.count, href: "/studio/process", description: "Edit the homepage design process" },
    { label: "City pages", count: cities.count, href: "/studio/cities", description: "Manage dynamic location pages" }
  ];
  if ([services, projects, faqs, steps, cities].some(item => item.error)) throw new Error("Unable to load Studio overview. Ensure migrations 002 and 005 are applied.");
  return <><CmsHeading title="Content overview" description="Manage the published experience of Bhavik's Interior, all from one place." />
    <div className="cms-metrics">{cards.map(card => <Link className="cms-metric" key={card.href} href={card.href}><span>{card.label}</span><strong>{card.count ?? "—"}</strong><small>{card.description} ↗</small></Link>)}</div>
    <div className="cms-surface"><div className="cms-section-heading"><h2>Quick actions</h2><p>Site content becomes public only when you explicitly publish it.</p></div>
      <div className="cms-quicklinks"><Link href="/studio/settings">Edit homepage &amp; site text ↗</Link><Link href="/studio/services/new">Create service ↗</Link><Link href="/studio/projects/new">Create project ↗</Link><Link href="/studio/media">Upload image ↗</Link></div>
    </div>
  </>;
}

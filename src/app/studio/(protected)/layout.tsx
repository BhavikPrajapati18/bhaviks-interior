import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { requireEditor } from "@/lib/auth";

const nav = [
  { href: "/studio", label: "Overview" },
  { href: "/studio/settings", label: "Site settings" },
  { href: "/studio/services", label: "Services" },
  { href: "/studio/projects", label: "Projects" },
  { href: "/studio/cities", label: "City pages" },
  { href: "/studio/journal", label: "Journal" },
  { href: "/studio/testimonials", label: "Testimonials" },
  { href: "/studio/team", label: "Team" },
  { href: "/studio/showcase", label: "Gallery & videos" },
  { href: "/studio/faqs", label: "FAQs" },
  { href: "/studio/process", label: "Our process" },
  { href: "/studio/media", label: "Media library" }
];
export default async function StudioProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase } = await requireEditor();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const isAdmin = profile?.role === "admin";
  return <div className="cms-layout">
    <aside className="cms-sidebar">
      <Link className="cms-brand" href="/studio">BHAVIK&apos;S <span>INTERIOR</span><small>CONTENT STUDIO</small></Link>
      <nav aria-label="Studio navigation">{nav.map(item => <Link href={item.href} key={item.href}>{item.label}</Link>)}{isAdmin && <Link href="/studio/admin">Operations / Admin</Link>}</nav>
      <div className="cms-sidebar-bottom"><small>Signed in as</small><p>{user.email}</p><Link href="/" target="_blank">View website ↗</Link><form action={signOut}><button type="submit">Sign out</button></form></div>
    </aside>
    <div className="cms-main"><div className="cms-mobile-top">
      <Link className="cms-mobile-brand" href="/studio">Content Studio</Link>
      <details className="cms-mobile-menu"><summary>Navigate <span aria-hidden="true">＋</span></summary>
        <nav aria-label="Mobile studio navigation">
          {nav.map(item => <Link href={item.href} key={item.href}>{item.label}</Link>)}
          {isAdmin && <Link href="/studio/admin">Operations / Admin</Link>}
          <Link href="/">View website</Link>
          <form action={signOut}><button type="submit">Sign out</button></form>
        </nav>
      </details>
    </div><main className="cms-content" id="studio-content">{children}</main></div>
  </div>;
}

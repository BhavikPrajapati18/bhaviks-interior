import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { requireEditor } from "@/lib/auth";

const nav = [
  { href: "/studio", label: "Overview" },
  { href: "/studio/settings", label: "Site settings" },
  { href: "/studio/services", label: "Services" },
  { href: "/studio/projects", label: "Projects" },
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
    <div className="cms-main"><div className="cms-mobile-top"><Link href="/studio">Content Studio</Link><Link href="/">View site ↗</Link><form action={signOut}><button type="submit">Sign out</button></form></div><main className="cms-content">{children}</main></div>
  </div>;
}

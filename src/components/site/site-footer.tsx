import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter({ demo, email, phone, services = [] }: { demo?: boolean; email?: string; phone?: string; services?: {title:string;slug:string}[] }) {
  return <footer className="footer"><div className="container">
    <div className="footer-main">
      <div>
        <Link href="/" className="brand"><span>BHAVIK&apos;S</span><span>INTERIOR</span></Link>
        <p className="footer-tagline">Spaces built around the things that make life yours.</p>
        <Link href="/contact" className="text-link" style={{ marginTop: 35 }}>Let&apos;s talk <ArrowUpRight size={16}/></Link>
      </div>
      <div><h4>Explore</h4><ul>
        {[{ href:"/",label:"Home" },{ href:"/about",label:"Our approach" },{ href:"/services",label:"Services" },{ href:"/projects",label:"Projects" },{ href:"/contact",label:"Contact" }].map(l => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
      </ul></div>
      <div><h4>What we do</h4><ul>{services.map(item => <li key={item.slug}><Link href={`/services/${item.slug}`}>{item.title}</Link></li>)}</ul>{email && <p className="footer-tagline"><a href={`mailto:${email}`}>{email}</a></p>}{phone && <p className="footer-tagline"><a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a></p>}</div>
    </div>
    <div className="footer-bottom"><p>© {new Date().getFullYear()} Bhavik&apos;s Interior. All rights reserved.</p><p>{demo ? "Preview mode · Sample content only" : "Made for the way you live"}</p></div>
  </div></footer>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Cities", href: "/cities" },
  { label: "Journal", href: "/journal" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

function active(href: string, path: string): boolean {
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}

export function SiteHeader() {
  const path = usePathname() || "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstMobileLinkRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const closeOnResize = () => { if (window.innerWidth > 1120) setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnResize);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnResize);
    };
  }, [open]);

  const darkHeader = scrolled || open || path !== "/";
  return (
    <header className={`header${darkHeader ? " scrolled" : ""}`}>
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Bhavik's Interior — home" onClick={() => setOpen(false)}>
          <span>BHAVIK&apos;S</span><span>INTERIOR</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map(link => <Link key={link.href} href={link.href} aria-current={active(link.href, path) ? "page" : undefined}>{link.label}</Link>)}
        </nav>
        <Link className="header-cta" href="/contact">Start a project <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <button ref={toggleRef} className="mobile-toggle" type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open} aria-controls="mobile-site-navigation"
          onClick={() => setOpen(value => !value)}>
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>
      {open && <nav id="mobile-site-navigation" className="mobile-nav" aria-label="Mobile navigation">
        {links.map((link, i) => <Link key={link.href} href={link.href} ref={i === 0 ? firstMobileLinkRef : undefined}
          aria-current={active(link.href, path) ? "page" : undefined}
          onClick={() => setOpen(false)}>{link.label}<ArrowUpRight aria-hidden="true" size={16}/></Link>)}
        <span className="mobile-nav-caption">THOUGHTFUL SPACES. TIMELESS DESIGN.</span>
      </nav>}
    </header>
  );
}

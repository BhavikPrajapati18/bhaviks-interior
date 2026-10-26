"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" }
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 35);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);
  return (
    <header className={`header ${scrolled || open ? "scrolled" : ""}`}>
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Bhavik's Interior home" onClick={() => setOpen(false)}>
          <span>BHAVIK&apos;S</span><span>INTERIOR</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <Link className="header-cta" href="/contact">Start a project <ArrowUpRight size={16} aria-hidden /></Link>
        <button className="mobile-toggle" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-site-navigation" onClick={() => setOpen(value => !value)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && <nav id="mobile-site-navigation" className="mobile-nav" aria-label="Mobile navigation">
        {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
      </nav>}
    </header>
  );
}

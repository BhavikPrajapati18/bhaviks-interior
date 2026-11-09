import type { Metadata, Viewport } from "next";
import { site, isPublicSite } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  metadataBase: new URL(site.url),
  applicationName: site.name,
  robots: { index: isPublicSite, follow: isPublicSite },
  openGraph: { siteName: site.name, locale: "en_IN", type: "website" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#34241c" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

import type { Metadata } from "next";
import { site } from "@/lib/site";

type MetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string | null;
};

/** Public origin only; never derive canonical URLs from incoming request headers. */
export function absoluteUrl(path = "/"): string {
  return new URL(path.replace(/^\/*/, "/"), site.url).toString();
}

export function pageMetadata({ title, description, path, image, imageAlt, type = "website", publishedTime }: MetadataOptions): Metadata {
  const fullTitle = title.toLowerCase().includes(site.name.toLowerCase()) ? title : `${title} | ${site.name}`;
  const commonGraph = {
    title: fullTitle,
    description,
    url: absoluteUrl(path),
    siteName: site.name,
    locale: "en_IN",
    ...(image ? { images: [{ url: image, alt: imageAlt || title }] } : {}),
  };
  const openGraph: Metadata["openGraph"] = type === "article"
    ? { ...commonGraph, type: "article", ...(publishedTime ? { publishedTime } : {}) }
    : { ...commonGraph, type: "website" };
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph,
    twitter: { card: image ? "summary_large_image" : "summary", title: fullTitle, description, ...(image ? { images: [image] } : {}) },
  };
}

/** Prevent strings in CMS content from ending an inline JSON-LD script. */
export function safeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}

export const privateRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
};

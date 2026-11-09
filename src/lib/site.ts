const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function siteOrigin(input: string): string {
  try {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
    return url.origin;
  } catch {
    return 'http://localhost:3000';
  }
}

export const site = {
  name: "Bhavik's Interior",
  url: siteOrigin(configuredUrl),
  description: "Thoughtful interiors shaped around the way you live.",
} as const;

export const isPublicSite = (() => {
  const url = new URL(site.url);
  return process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview' &&
    url.protocol === 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname);
})();

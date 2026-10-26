export type SiteConfig = {
  brand_name: string;
  hero_eyebrow: string;
  hero_heading: string;
  hero_description: string;
  hero_image: string;
  introduction_eyebrow: string;
  introduction_heading: string;
  introduction_body: string;
  story_image: string;
  cta_image: string;
  about_page_eyebrow: string; about_page_heading: string; about_page_description: string;
  services_page_eyebrow: string; services_page_heading: string; services_page_description: string;
  projects_page_eyebrow: string; projects_page_heading: string; projects_page_description: string;
  contact_page_eyebrow: string; contact_page_heading: string; contact_page_description: string;
  services_eyebrow: string;
  services_heading: string;
  services_description: string;
  projects_eyebrow: string;
  projects_heading: string;
  projects_description: string;
  process_eyebrow: string;
  process_heading: string;
  process_description: string;
  faq_eyebrow: string;
  faq_heading: string;
  faq_description: string;
  cta_heading: string;
  cta_description: string;
  contact_email: string;
  contact_phone: string;
  seo_title: string;
  seo_description: string;
};
export type Service = {
  id: string; slug: string; title: string; description: string;
  image_url: string; category: string;
  long_description?: string; features?: string[];
  meta_title?: string; meta_description?: string;
  is_published?: boolean; display_order?: number;
};
export type Project = {
  id: string; slug: string; title: string; location: string;
  category: string; description: string; cover_image: string;
  gallery_images?: string[]; project_year?: string;
  meta_title?: string; meta_description?: string;
  is_published?: boolean; display_order?: number;
};
export type Faq = {
  id: string; question: string; answer: string;
  is_published?: boolean; display_order?: number;
};
export type ProcessStep = {
  id: string; title: string; description: string;
  is_published?: boolean; display_order?: number;
};

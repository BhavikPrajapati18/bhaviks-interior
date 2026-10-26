"use client";
import { useActionState, useState } from "react";
import { ImageUploadField } from "./image-upload-field";
import { saveSiteSettings } from "@/lib/actions/cms";
import type { SiteConfig } from "@/lib/content/types";
import { SaveNotice } from "./ui";

const groups: { title: string; description: string; fields: { name: keyof SiteConfig; label: string; multi?: boolean; image?: boolean }[] }[] = [
  { title: "Hero", description: "The first impression on your homepage.", fields: [
    { name: "hero_eyebrow", label: "Eyebrow" }, { name: "hero_heading", label: "Heading" },
    { name: "hero_description", label: "Description", multi: true }, { name: "hero_image", label: "Hero image", image: true }
  ] },
  { title: "Story & About", description: "Shared by the homepage and About page.", fields: [
    { name: "introduction_eyebrow", label: "Eyebrow" }, { name: "introduction_heading", label: "Heading" },
    { name: "introduction_body", label: "Studio story", multi: true }, { name: "story_image", label: "Story image", image: true }
  ] },
  { title: "About page banner", description: "The introduction visitors see when opening the About page.", fields: [
    { name: "about_page_eyebrow", label: "Eyebrow" }, { name: "about_page_heading", label: "Heading" },
    { name: "about_page_description", label: "Description", multi: true }
  ] },
  { title: "Services page banner", description: "Title and copy for the full services listing.", fields: [
    { name: "services_page_eyebrow", label: "Eyebrow" }, { name: "services_page_heading", label: "Heading" },
    { name: "services_page_description", label: "Description", multi: true }
  ] },
  { title: "Projects page banner", description: "Title and copy for the portfolio listing.", fields: [
    { name: "projects_page_eyebrow", label: "Eyebrow" }, { name: "projects_page_heading", label: "Heading" },
    { name: "projects_page_description", label: "Description", multi: true }
  ] },
  { title: "Contact page banner", description: "Headline and introduction for the contact form.", fields: [
    { name: "contact_page_eyebrow", label: "Eyebrow" }, { name: "contact_page_heading", label: "Heading" },
    { name: "contact_page_description", label: "Description", multi: true }
  ] },
  { title: "Services section", description: "Section heading and introductory text.", fields: [
    { name: "services_eyebrow", label: "Eyebrow" }, { name: "services_heading", label: "Heading" },
    { name: "services_description", label: "Description", multi: true }
  ] },
  { title: "Projects section", description: "Copy above the selected portfolio grid.", fields: [
    { name: "projects_eyebrow", label: "Eyebrow" }, { name: "projects_heading", label: "Heading" },
    { name: "projects_description", label: "Description", multi: true }
  ] },
  { title: "Process section", description: "Manage individual process steps from the separate Process editor.", fields: [
    { name: "process_eyebrow", label: "Eyebrow" }, { name: "process_heading", label: "Heading" },
    { name: "process_description", label: "Description", multi: true }
  ] },
  { title: "FAQs & Call to Action", description: "Visible near the bottom of the homepage.", fields: [
    { name: "faq_eyebrow", label: "FAQ eyebrow" }, { name: "faq_heading", label: "FAQ heading" },
    { name: "faq_description", label: "FAQ description", multi: true },
    { name: "cta_heading", label: "CTA heading" }, { name: "cta_description", label: "CTA description", multi: true },
    { name: "cta_image", label: "CTA background image", image: true }
  ] },
  { title: "Contact & Search", description: "Public contact details and basic search preview metadata.", fields: [
    { name: "contact_email", label: "Public email (optional)" }, { name: "contact_phone", label: "Public phone (optional)" },
    { name: "seo_title", label: "Homepage SEO title" }, { name: "seo_description", label: "Homepage SEO description", multi: true }
  ] }
];

export function SettingsEditor({ config }: { config: SiteConfig }) {
  const [state, action, pending] = useActionState(saveSiteSettings, { message: "", error: "" });
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const uploading = Object.values(uploadingFields).some(Boolean);
  return <form action={action} className="cms-stack" onSubmit={event => { if (uploading) event.preventDefault(); }}>
    {groups.map(group => <section className="cms-surface" key={group.title}>
      <div className="cms-section-heading"><h2>{group.title}</h2><p>{group.description}</p></div>
      <div className="cms-fields">{group.fields.map(field => field.image
        ? <ImageUploadField
            key={field.name}
            name={field.name}
            label={field.label}
            initialValue={config[field.name]}
            required
            onUploadingChange={busy => setUploadingFields(previous => ({ ...previous, [field.name]: busy }))}
          />
        : <label className="cms-field" key={field.name}>
            <span>{field.label}</span>
            {field.multi ? <textarea name={field.name} rows={3} defaultValue={config[field.name]} required={field.name !== "contact_email"} />
              : <input name={field.name} type={field.name === "contact_email" ? "email" : "text"} defaultValue={config[field.name]} required={field.name !== "contact_email" && field.name !== "contact_phone"} />}
          </label>
      )}</div>
    </section>)}
    <div className="cms-form-footer"><button className="btn btn-primary" disabled={pending || uploading} type="submit">{pending ? "Saving…" : "Publish site settings"}</button><SaveNotice state={state}/></div>
  </form>;
}

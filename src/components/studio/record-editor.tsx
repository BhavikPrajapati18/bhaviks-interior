"use client";
import { useActionState, useState } from "react";
import { ImageUploadField } from "./image-upload-field";
import { upsertService, upsertProject, upsertFaq, upsertProcess } from "@/lib/actions/cms";
import type { Faq, ProcessStep, Project, Service } from "@/lib/content/types";
import { SaveNotice } from "./ui";

type Mode = "services" | "projects" | "faqs" | "process";
type Field = { key: string; label: string; kind?: "textarea" | "image" | "gallery"; required?: boolean; help?: string };
const fields: Record<Mode, Field[]> = {
  services: [
    { key: "title", label: "Service title", required: true }, { key: "slug", label: "URL slug", required: true },
    { key: "category", label: "Category", required: true }, { key: "image_url", label: "Service cover image", required: true, kind: "image" },
    { key: "description", label: "Short description", required: true, kind: "textarea" },
    { key: "long_description", label: "Full description", kind: "textarea" },
    { key: "features", label: "Features — one per line", kind: "textarea" },
    { key: "meta_title", label: "SEO title" }, { key: "meta_description", label: "SEO description", kind: "textarea" }
  ],
  projects: [
    { key: "title", label: "Project title", required: true }, { key: "slug", label: "URL slug", required: true },
    { key: "category", label: "Category", required: true }, { key: "location", label: "Location" },
    { key: "project_year", label: "Year" }, { key: "cover_image", label: "Project cover image", kind: "image", required: true },
    { key: "description", label: "Project story", kind: "textarea", required: true },
    { key: "gallery_images", label: "Project gallery", kind: "gallery", help: "Drop multiple images here (maximum 24)." },
    { key: "meta_title", label: "SEO title" }, { key: "meta_description", label: "SEO description", kind: "textarea" }
  ],
  faqs: [
    { key: "question", label: "Question", required: true }, { key: "answer", label: "Answer", required: true, kind: "textarea" }
  ],
  process: [
    { key: "title", label: "Step title", required: true }, { key: "description", label: "Step description", required: true, kind: "textarea" }
  ]
};
const actions = { services: upsertService, projects: upsertProject, faqs: upsertFaq, process: upsertProcess };
type RecordValue = Partial<Service & Project & Faq & ProcessStep> & { id?: string };

export function RecordEditor({ mode, initial }: { mode: Mode; initial?: RecordValue }) {
  const [state, action, pending] = useActionState(actions[mode], { message: "", error: "" });
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const uploading = Object.values(uploadingFields).some(Boolean);
  const setFieldUploading = (key: string, uploading: boolean) =>
    setUploadingFields(previous => ({ ...previous, [key]: uploading }));
  const value = (key: string): string => {
    const content = (initial as Record<string, unknown> | undefined)?.[key];
    return Array.isArray(content) ? content.join("\n") : (content === null || content === undefined ? "" : String(content));
  };
  return <form action={action} className="cms-surface cms-form" onSubmit={event => { if (uploading) event.preventDefault(); }}>
    {initial?.id && <input type="hidden" name="id" value={initial.id} />}
    <div className="cms-fields">
      {fields[mode].map(field => field.kind === "image" || field.kind === "gallery"
        ? <ImageUploadField
            key={field.key}
            name={field.key}
            label={field.label}
            initialValue={field.kind === "gallery" ? value(field.key).split("\n").filter(Boolean) : value(field.key)}
            multiple={field.kind === "gallery"}
            maxImages={24}
            required={field.required}
            help={field.help}
            onUploadingChange={busy => setFieldUploading(field.key, busy)}
          />
        : <label key={field.key} className="cms-field">
            <span>{field.label}{field.required ? " *" : ""}</span>
            {field.kind === "textarea"
              ? <textarea key={`${initial?.id ?? 'new'}-${field.key}`} name={field.key} defaultValue={value(field.key)} rows={field.key === "long_description" || field.key === "description" ? 5 : 3} required={field.required}/>
              : <input key={`${initial?.id ?? 'new'}-${field.key}`} type="text" name={field.key} defaultValue={value(field.key)} required={field.required} />}
            {field.help && <small>{field.help}</small>}
          </label>
      )}
      <label className="cms-field"><span>Display order</span><input name="display_order" type="number" min={0} max={100000} defaultValue={initial?.display_order ?? 0} required /></label>
      <label className="cms-checkbox"><input name="is_published" type="checkbox" defaultChecked={initial?.is_published ?? false}/><span>Published — visible on the public website</span></label>
    </div>
    <div className="cms-form-footer"><button className="btn btn-primary" disabled={pending || uploading} type="submit">{pending ? "Saving…" : initial?.id ? "Save changes" : "Create record"}</button><SaveNotice state={state}/></div>
    <p className="cms-hint">Images upload immediately to your public media bucket, but the content changes appear only after Save. Don&apos;t upload private customer documents.</p>
  </form>;
}

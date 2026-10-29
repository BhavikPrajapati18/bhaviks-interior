"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ImageUploadField } from "@/components/studio/image-upload-field";
import { deleteCityPage, saveCityPage } from "@/lib/actions/cities";
import type { CityPage, CityFaq, CityHighlight, CityTestimonial } from "@/lib/cities";

type Option = { slug: string; title: string };
type CityEditorProps = { initial?: CityPage; services: Option[]; projects: Option[] };

type RepeatKeys = "title" | "description" | "quote" | "name" | "details" | "question" | "answer";
function Repeatable<T extends Record<K, string>, K extends RepeatKeys>({
  name, label, value, onChange, keys, limit, empty
}: {
  name: string;
  label: string;
  value: T[];
  onChange: (value: T[]) => void;
  keys: { key: K; label: string; placeholder?: string; multiline?: boolean }[];
  limit: number;
  empty: T;
}) {
  return <div className="city-repeat">
    <div className="city-repeat-heading"><h3>{label}</h3><span>{value.length}/{limit}</span></div>
    <input type="hidden" name={name} value={JSON.stringify(value)}/>
    {value.map((item, index) => <div className="city-repeat-row" key={`${name}-${index}`}>
      <div className="city-repeat-fields">{keys.map(({ key, label: fieldLabel, placeholder, multiline }) => <label className="cms-field" key={key}>
        <span>{fieldLabel}</span>
        {multiline ? <textarea rows={3} maxLength={700} placeholder={placeholder} value={item[key]} onChange={event => onChange(value.map((row, i) => i === index ? { ...row, [key]: event.target.value } : row))}/>
          : <input maxLength={700} placeholder={placeholder} value={item[key]} onChange={event => onChange(value.map((row, i) => i === index ? { ...row, [key]: event.target.value } : row))}/>}
      </label>)}</div>
      <button className="cms-danger-link city-remove" type="button" onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove item</button>
    </div>)}
    {value.length < limit && <button type="button" className="city-add" onClick={() => onChange([...value, { ...empty }])}>+ Add {label.toLowerCase().replace(/s$/, "")}</button>}
  </div>;
}

function ChoiceList({ name, label, items, selected }: { name: string; label: string; items: Option[]; selected: string[] }) {
  return <fieldset className="city-options"><legend>{label}</legend>
    {items.length ? <div className="city-options-grid">{items.map(item => <label key={item.slug}>
      <input type="checkbox" name={name} value={item.slug} defaultChecked={selected.includes(item.slug)}/><span>{item.title}</span>
    </label>)}</div> : <p className="city-form-help">Create services or projects in the Studio first. They will appear here for selection.</p>}
    <p className="city-form-help">Only published selections are displayed on the public city page.</p>
  </fieldset>;
}

export function CityEditor({ initial, services, projects }: CityEditorProps) {
  const [state, action, pending] = useActionState(saveCityPage, { error: "", message: "" });
  const [uploadCount, setUploadCount] = useState(0);
  const [published, setPublished] = useState(initial?.is_published ?? false);
  const [highlights, setHighlights] = useState<CityHighlight[]>(initial?.highlights ?? []);
  const [testimonials, setTestimonials] = useState<CityTestimonial[]>(initial?.testimonials ?? []);
  const [faqs, setFaqs] = useState<CityFaq[]>(initial?.faqs ?? []);
  const uploading = uploadCount > 0;
  const uploadingChange = (active: boolean) => setUploadCount(n => Math.max(0, n + (active ? 1 : -1)));

  return <div className="journal-editor-wrap">
    <form action={action} className="cms-surface city-editor">
      {initial && <input name="id" value={initial.id} type="hidden"/>}
      <div className="city-form-section"><h2>01 / City & publication</h2>
        <div className="cms-fields">
          <label className="cms-field"><span>City name *</span><input name="city_name" required minLength={2} maxLength={90} defaultValue={initial?.city_name ?? ""} placeholder="e.g. Mumbai"/></label>
          <label className="cms-field"><span>State / region</span><input name="region_name" maxLength={120} defaultValue={initial?.region_name ?? ""} placeholder="e.g. Maharashtra"/></label>
          <label className="cms-field"><span>City URL slug *</span><input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={120} defaultValue={initial?.slug ?? ""} placeholder="e.g. mumbai"/></label>
          <label className="cms-field"><span>Display order</span><input name="display_order" type="number" min={0} max={100000} defaultValue={initial?.display_order ?? 0}/></label>
          <label className="cms-field ops-span"><span>Visibility</span><select name="is_published" value={published ? "true" : "false"} onChange={e => setPublished(e.target.value === "true") }><option value="false">Draft — editors only</option><option value="true">Published — publicly visible</option></select></label>
        </div>
      </div>
      <div className="city-form-section"><h2>02 / Hero</h2><div className="cms-fields">
        <label className="cms-field"><span>Eyebrow</span><input name="hero_eyebrow" maxLength={100} defaultValue={initial?.hero_eyebrow ?? "DESIGNED FOR YOUR CITY"}/></label>
        <label className="cms-field ops-span"><span>Hero heading *</span><input name="hero_heading" maxLength={180} defaultValue={initial?.hero_heading ?? ""} placeholder="Spaces that feel like home"/></label>
        <label className="cms-field ops-span"><span>Hero description *</span><textarea name="hero_description" rows={3} maxLength={900} defaultValue={initial?.hero_description ?? ""}/></label>
        <div className="ops-span"><ImageUploadField name="hero_image" label="Hero image" initialValue={initial?.hero_image} onUploadingChange={uploadingChange}/></div>
        <label className="cms-field ops-span"><span>Hero image alt text</span><input name="hero_image_alt" maxLength={240} defaultValue={initial?.hero_image_alt ?? ""}/></label>
      </div></div>
      <div className="city-form-section"><h2>03 / Introduction</h2><div className="cms-fields">
        <label className="cms-field"><span>Eyebrow</span><input name="intro_eyebrow" maxLength={100} defaultValue={initial?.intro_eyebrow ?? "OUR APPROACH"}/></label>
        <label className="cms-field ops-span"><span>Heading</span><input name="intro_heading" maxLength={180} defaultValue={initial?.intro_heading ?? ""}/></label>
        <label className="cms-field ops-span"><span>Story / introduction</span><textarea name="intro_body" rows={5} maxLength={5000} defaultValue={initial?.intro_body ?? ""}/></label>
        <div className="ops-span"><ImageUploadField name="intro_image" label="Introduction image" initialValue={initial?.intro_image} onUploadingChange={uploadingChange}/></div>
        <label className="cms-field ops-span"><span>Introduction image alt text</span><input name="intro_image_alt" maxLength={240} defaultValue={initial?.intro_image_alt ?? ""}/></label>
      </div></div>
      <div className="city-form-section"><h2>04 / Services & benefits</h2><div className="cms-fields">
        <label className="cms-field ops-span"><span>Services section heading</span><input name="services_heading" maxLength={150} defaultValue={initial?.services_heading ?? "INTERIOR DESIGN SERVICES"}/></label>
        <div className="ops-span"><ChoiceList name="service_slugs" label="Featured services" items={services} selected={initial?.service_slugs ?? []}/></div>
        <label className="cms-field ops-span"><span>Benefits section heading</span><input name="highlights_heading" maxLength={150} defaultValue={initial?.highlights_heading ?? "WHY WORK WITH US"}/></label>
        <div className="ops-span"><Repeatable name="highlights" label="Benefits" value={highlights} onChange={setHighlights} keys={[{key:"title",label:"Title"},{key:"description",label:"Description",multiline:true}]} limit={8} empty={{title:"",description:""}}/></div>
      </div></div>
      <div className="city-form-section"><h2>05 / Portfolio & client stories</h2><div className="cms-fields">
        <label className="cms-field ops-span"><span>Project section heading</span><input name="projects_heading" maxLength={150} defaultValue={initial?.projects_heading ?? "SELECTED PROJECTS"}/></label>
        <div className="ops-span"><ChoiceList name="project_slugs" label="Featured portfolio projects" items={projects} selected={initial?.project_slugs ?? []}/></div>
        <label className="cms-field ops-span"><span>Testimonials heading</span><input name="testimonials_heading" maxLength={150} defaultValue={initial?.testimonials_heading ?? "CLIENT STORIES"}/></label>
        <div className="ops-span"><Repeatable name="testimonials" label="Testimonials" value={testimonials} onChange={setTestimonials} keys={[{key:"quote",label:"Verified client quote",multiline:true},{key:"name",label:"Client name"},{key:"details",label:"Location / project (optional)"}]} limit={8} empty={{quote:"",name:"",details:""}}/></div>
      </div></div>
      <div className="city-form-section"><h2>06 / FAQs</h2><div className="cms-fields">
        <label className="cms-field ops-span"><span>FAQ heading</span><input name="faqs_heading" maxLength={150} defaultValue={initial?.faqs_heading ?? "FREQUENTLY ASKED QUESTIONS"}/></label>
        <div className="ops-span"><Repeatable name="faqs" label="FAQs" value={faqs} onChange={setFaqs} keys={[{key:"question",label:"Question"},{key:"answer",label:"Answer",multiline:true}]} limit={20} empty={{question:"",answer:""}}/></div>
      </div></div>
      <div className="city-form-section"><h2>07 / Consultation CTA & SEO</h2><div className="cms-fields">
        <label className="cms-field ops-span"><span>CTA headline</span><input name="cta_heading" maxLength={180} defaultValue={initial?.cta_heading ?? "LET US DESIGN YOUR SPACE."}/></label>
        <label className="cms-field ops-span"><span>CTA description</span><textarea name="cta_description" rows={3} maxLength={500} defaultValue={initial?.cta_description ?? ""}/></label>
        <label className="cms-field"><span>CTA button label</span><input name="cta_button_label" maxLength={80} defaultValue={initial?.cta_button_label ?? "START A CONVERSATION"}/></label>
        <label className="cms-field"><span>SEO title (optional)</span><input name="meta_title" maxLength={180} defaultValue={initial?.meta_title ?? ""}/></label>
        <label className="cms-field ops-span"><span>SEO description</span><textarea name="meta_description" rows={3} maxLength={300} defaultValue={initial?.meta_description ?? ""}/></label>
      </div></div>
      <div className="cms-form-footer"><button type="submit" className="btn btn-primary" disabled={pending || uploading}>{pending ? "Saving…" : uploading ? "Uploading…" : published ? "Save & publish" : "Save draft"}</button>
        <span role="status" aria-live="polite">{state.error ? <span className="cms-error">{state.error}</span> : <span className="cms-success">{state.message}</span>}</span>
      </div>
    </form>
    {initial && <div className="cms-surface journal-bottom-actions"><Link href={`/cities/${initial.slug}`} target="_blank">View public city page ↗</Link>
      <form action={deleteCityPage} onSubmit={event => { if (!window.confirm("Permanently delete this city page?")) event.preventDefault(); }}><input type="hidden" name="id" value={initial.id}/><button type="submit" className="cms-danger-link">Delete city</button></form>
    </div>}
  </div>;
}

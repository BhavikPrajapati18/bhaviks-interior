"use client";

import { useActionState, useState } from "react";
import { ImageUploadField } from "@/components/studio/image-upload-field";
import { SaveNotice } from "@/components/studio/ui";
import { saveEditorial } from "@/lib/actions/editorial";
import type { ShowcaseItem, TeamMember, Testimonial } from "@/lib/editorial";

type Kind = "testimonials" | "team" | "showcase";
type Record = Partial<Testimonial & TeamMember & ShowcaseItem> & { id?: string };

export function EditorialEditor({ kind, initial }: { kind: Kind; initial?: Record }) {
  const action = saveEditorial.bind(null, kind);
  const [state, submit, pending] = useActionState(action, { error: "", message: "" });
  const [uploading, setUploading] = useState(false);
  const [mediaKind, setMediaKind] = useState<"image" | "video">(initial?.media_kind || "image");
  const [published, setPublished] = useState(Boolean(initial?.is_published));
  const textField = (key: string, label: string, required = false, maxLength = 160) => (
    <label className="cms-field" key={key}><span>{label}{required ? " *" : ""}</span>
      <input name={key} type="text" defaultValue={String(initial?.[key as keyof Record] ?? "")} required={required} maxLength={maxLength} />
    </label>
  );
  const description = (key: string, label: string, required = false, maxLength = 2500) => (
    <label className="cms-field exp-full" key={key}><span>{label}{required ? " *" : ""}</span>
      <textarea name={key} rows={4} required={required} maxLength={maxLength} defaultValue={String(initial?.[key as keyof Record] ?? "")} />
    </label>
  );
  return <form action={submit} className="cms-surface cms-form" onSubmit={e => { if (uploading) e.preventDefault(); }}>
    {initial?.id && <input name="id" type="hidden" value={initial.id}/>}
    <div className="cms-fields">
      {kind === "testimonials" && <>
        {textField("client_name", "Client name", true, 120)}
        {textField("client_location", "Location", false, 160)}
        {textField("project_label", "Project label", false, 160)}
        <label className="cms-field"><span>Rating (1–5)</span><select name="rating" defaultValue={initial?.rating ?? 5}>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>)}
        </select></label>
        {description("quote", "Testimonial — publish only with client's permission", true, 2000)}
        <div className="exp-full"><ImageUploadField name="image_url" label="Optional client / project image" initialValue={initial?.image_url || ""} onUploadingChange={setUploading}/></div>
      </>}
      {kind === "team" && <>
        {textField("full_name", "Team member", true, 120)}
        {textField("job_title", "Role", true, 120)}
        {description("biography", "Biography", false, 2500)}
        <div className="exp-full"><ImageUploadField name="image_url" label="Portrait" initialValue={initial?.image_url || ""} onUploadingChange={setUploading}/></div>
      </>}
      {kind === "showcase" && <>
        {textField("title", "Media title", true, 160)}
        {textField("category", "Category", true, 120)}
        <label className="cms-field"><span>Type</span><select name="media_kind" value={mediaKind} onChange={e => setMediaKind(e.target.value as "image" | "video")}>
          <option value="image">Photograph</option><option value="video">Video</option>
        </select></label>
        <label className="cms-checkbox"><input type="checkbox" name="is_featured" defaultChecked={initial?.is_featured ?? false}/> Feature on homepage</label>
        {description("description", "Caption / description", false, 1600)}
        <div className="exp-full"><ImageUploadField name="image_url" label={mediaKind === "video" ? "Video cover / poster image" : "Gallery image"} initialValue={initial?.image_url || ""} onUploadingChange={setUploading} required={published}/></div>
        {textField("image_alt", "Image alternative text", published, 240)}
        {mediaKind === "image" && <input type="hidden" name="video_url" value=""/>}
        {mediaKind === "video" && <label className="cms-field"><span>Video URL *</span><input name="video_url" required={published} type="url" placeholder="https://www.youtube.com/watch?v=…" defaultValue={initial?.video_url || ""}/><small>YouTube, Vimeo, or HTTPS MP4/WebM URL. Video file uploads are not enabled.</small></label>}
      </>}
      <label className="cms-field"><span>Display order</span><input name="display_order" type="number" min={0} max={100000} defaultValue={initial?.display_order ?? 0} required /></label>
      <label className="cms-checkbox"><input name="is_published" type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}/><span>Published — visible publicly</span></label>
    </div>
    <div className="cms-form-footer"><button type="submit" className="btn btn-primary" disabled={pending || uploading}>{pending ? "Saving…" : uploading ? "Uploading…" : initial?.id ? "Save changes" : "Create record"}</button><SaveNotice state={state}/></div>
    <p className="cms-hint">Add only genuine, approved content. Images upload to your public media bucket immediately; press Save to publish edits.</p>
  </form>;
}

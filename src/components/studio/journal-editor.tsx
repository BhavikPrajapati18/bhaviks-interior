"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ImageUploadField } from "@/components/studio/image-upload-field";
import { saveJournalPost, deleteJournalPost } from "@/lib/actions/journal";
import type { JournalPost } from "@/lib/journal";

export function JournalEditor({ initial }: { initial?: JournalPost }) {
  const [state, action, pending] = useActionState(saveJournalPost, { error: "", message: "" });
  const [uploading, setUploading] = useState(false);
  const [published, setPublished] = useState(initial?.is_published ?? false);
  return <div className="journal-editor-wrap">
    <form action={action} className="cms-surface journal-editor">
      {initial && <input name="id" type="hidden" value={initial.id} />}
      <div className="cms-fields">
        <label className="cms-field ops-span"><span>Article title *</span><input name="title" required minLength={3} maxLength={180} defaultValue={initial?.title || ""} placeholder="Thoughtful design starts at home" /></label>
        <label className="cms-field"><span>URL slug *</span><input name="slug" required maxLength={140} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={initial?.slug || ""} placeholder="thoughtful-design" /></label>
        <label className="cms-field"><span>Category *</span><input name="category" required maxLength={80} defaultValue={initial?.category || "Design Journal"} /></label>
        <label className="cms-field"><span>Author *</span><input name="author_name" required maxLength={120} defaultValue={initial?.author_name || "Bhavik's Interior"} /></label>
        <label className="cms-field"><span>Tags (comma separated)</span><input name="tags" maxLength={500} defaultValue={initial?.tags?.join(", ") || ""} placeholder="materials, planning, residences" /></label>
        <label className="cms-field ops-span"><span>Short excerpt *</span><textarea name="excerpt" rows={3} maxLength={600} required defaultValue={initial?.excerpt || ""} placeholder="One to two sentences for article previews and search engines." /></label>
        <label className="cms-field ops-span"><span>Article body *</span><textarea name="body" rows={18} maxLength={40000} required defaultValue={initial?.body || ""} placeholder={"Start writing your article here...\n\n## A section heading\n\nUse blank lines between paragraphs and ## for headings."} /><small>Plain text with simple # headings and - bullet lists. HTML and scripts are never rendered.</small></label>
        <div className="ops-span"><ImageUploadField name="cover_image" label="Cover image" initialValue={initial?.cover_image} onUploadingChange={setUploading} help="Drag/drop or choose an original, licensed image. Image is optional." /></div>
        <label className="cms-field ops-span"><span>Cover image alternative text</span><input name="cover_alt" maxLength={240} defaultValue={initial?.cover_alt || ""} placeholder="Bright modern living space featuring natural timber" /><small>Required when publishing with a cover image.</small></label>
        <label className="cms-field"><span>SEO title</span><input name="meta_title" maxLength={180} defaultValue={initial?.meta_title || ""} /></label>
        <label className="cms-field"><span>SEO description</span><textarea name="meta_description" rows={3} maxLength={300} defaultValue={initial?.meta_description || ""} /></label>
        <label className="cms-field ops-span"><span>Visibility</span><select name="is_published" value={published ? "true" : "false"} onChange={e => setPublished(e.target.value === "true")}>
          <option value="false">Draft — visible to editors only</option>
          <option value="true">Published — visible on website</option>
        </select></label>
      </div>
      <div className="cms-form-footer">
        <button type="submit" className="btn btn-primary" disabled={pending || uploading}>{pending ? "Saving…" : uploading ? "Uploading…" : published ? "Save & publish" : "Save draft"}</button>
        <div role="status" aria-live="polite">{state.error ? <p className="cms-error">{state.error}</p> : state.message ? <p className="cms-success">{state.message}</p> : null}</div>
      </div>
    </form>
    {initial && <div className="cms-surface journal-bottom-actions">{initial.is_published ? <Link href={`/journal/${initial.slug}`} target="_blank" rel="noopener noreferrer">View public article ↗</Link> : <span className="cms-hint">Draft article — not publicly visible.</span>}<form action={deleteJournalPost} onSubmit={e => { if (!window.confirm("Permanently delete this article?")) e.preventDefault(); }}><input name="id" type="hidden" value={initial.id}/><button type="submit" className="cms-danger-link">Delete article</button></form></div>}
  </div>;
}

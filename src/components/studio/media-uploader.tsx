"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const mimeToExtension: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif"
};
export function MediaUploader() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [url, setUrl] = useState("");
  async function upload(formData: FormData) {
    const file = formData.get("photo");
    if (!(file instanceof File) || !file.size) { setStatus("Choose an image first."); return; }
    const ext = mimeToExtension[file.type];
    if (!ext) { setStatus("JPEG, PNG, WebP or AVIF only."); return; }
    if (file.size > 5 * 1024 * 1024) { setStatus("Image must be 5MB or smaller."); return; }
    setUploading(true); setStatus(""); setUrl("");
    try {
      const supabase = createSupabaseBrowserClient();
      const path = `marketing/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("studio-media").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("studio-media").getPublicUrl(path);
      setUrl(data.publicUrl);
      setStatus("Uploaded. Copy the URL into a content editor.");
      // The server-rendered list updates when the user refreshes or navigates back here.
    } catch (error) { setStatus(error instanceof Error ? error.message : "Upload failed."); }
    finally { setUploading(false); }
  }
  return <form action={upload} className="cms-surface cms-upload">
    <h2>Upload a public image</h2><p>Images only, up to 5MB each. Do not upload confidential client files.</p>
    <input aria-label="Choose image" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required />
    <button className="btn btn-primary" type="submit" disabled={uploading}>{uploading ? "Uploading…" : "Upload image"}</button>
    {status && <p className="cms-hint" role="status">{status}</p>}
    {url && <div className="cms-link-copy"><input aria-label="Uploaded image URL" readOnly value={url} onFocus={e => e.currentTarget.select()}/><button type="button" onClick={() => navigator.clipboard.writeText(url)}>Copy URL</button></div>}
  </form>;
}

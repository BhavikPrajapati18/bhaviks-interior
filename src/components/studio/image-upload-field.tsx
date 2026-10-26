"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const ACCEPTED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const BUCKET = "studio-media";

type Props = {
  name: string;
  label: string;
  initialValue?: string | string[] | null;
  multiple?: boolean;
  maxImages?: number;
  required?: boolean;
  help?: string;
  onUploadingChange?: (uploading: boolean) => void;
};

export function ImageUploadField({
  name,
  label,
  initialValue,
  multiple = false,
  maxImages = 24,
  required = false,
  help,
  onUploadingChange,
}: Props) {
  const [images, setImages] = useState<string[]>(() =>
    (Array.isArray(initialValue) ? initialValue : initialValue ? [initialValue] : []).filter(Boolean),
  );
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const limit = multiple ? maxImages : 1;

  async function uploadFiles(fileList: FileList | File[]) {
    if (uploading) return;
    const selected = Array.from(fileList);
    if (!selected.length) return;
    const chosen = multiple ? selected : selected.slice(0, 1);
    const available = multiple ? limit - images.length : 1;
    if (chosen.length > available) {
      setError(`You can add up to ${limit} ${limit === 1 ? "image" : "images"}. Remove an existing image first.`);
      return;
    }
    for (const file of chosen) {
      if (!ACCEPTED_TYPES[file.type]) {
        setError(`${file.name}: only JPG, PNG, WebP or AVIF images are supported.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name}: each image must be 5 MB or smaller.`);
        return;
      }
    }

    setError("");
    setNotice("");
    setUploading(true);
    onUploadingChange?.(true);
    let uploaded = 0;
    try {
      const supabase = createSupabaseBrowserClient();
      for (const file of chosen) {
        const path = `marketing/${crypto.randomUUID()}.${ACCEPTED_TYPES[file.type]}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(uploadError.message);
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        setImages(previous => multiple ? [...previous, data.publicUrl] : [data.publicUrl]);
        uploaded += 1;
      }
      setNotice(`${uploaded} ${uploaded === 1 ? "image" : "images"} uploaded. Click Save to apply to the website.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Image upload failed. Please try again.");
      if (uploaded) setNotice(`${uploaded} image(s) uploaded before the error. Click Save to keep them.`);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void uploadFiles(event.target.files);
  }
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) void uploadFiles(event.dataTransfer.files);
  }
  function removeImage(index: number) {
    setImages(previous => previous.filter((_, i) => i !== index));
    setNotice("Image removed from this form. Click Save to apply.");
    setError("");
  }

  return (
    <div className="cms-field cms-image-field">
      <span>{label}{required ? " *" : ""}</span>
      <input type="hidden" name={name} value={multiple ? images.join("\n") : images[0] ?? ""} />
      <input
        ref={fileInput}
        className="cms-file-input"
        aria-label={`Choose ${label.toLowerCase()}`}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        onChange={handleFileSelection}
        disabled={uploading}
      />
      <div
        className={`cms-image-dropzone${dragging ? " is-dragging" : ""}`}
        onDragOver={event => { event.preventDefault(); if (!uploading) setDragging(true); }}
        onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
        onDrop={handleDrop}
        data-uploading={uploading ? "true" : "false"}
      >
        <div className="cms-image-dropzone-title">{uploading ? "Uploading image…" : "Drag & drop images here"}</div>
        <p>JPG, PNG, WebP, AVIF · Maximum 5 MB per image</p>
        <button
          className="cms-image-choose"
          type="button"
          disabled={uploading || (multiple && images.length >= limit)}
          onClick={() => fileInput.current?.click()}
        >
          {uploading ? "Uploading…" : multiple ? "Choose images" : images.length ? "Replace image" : "Choose image"}
        </button>
      </div>
      {images.length > 0 && (
        <div className={`cms-image-previews${multiple ? " is-gallery" : ""}`}>
          {images.map((url, index) => (
            <div className="cms-image-preview" key={`${url}-${index}`}>
              {/* Storage host is configured at runtime; no static image optimization host is assumed. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${label} preview ${index + 1}`} loading="lazy" />
              <button type="button" onClick={() => removeImage(index)} disabled={uploading} aria-label={`Remove image ${index + 1}`}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {multiple && <small>{images.length} / {limit} images selected</small>}
      {help && <small>{help}</small>}
      {error && <p className="cms-upload-error" role="alert">{error}</p>}
      {notice && !error && <p className="cms-upload-notice" role="status">{notice}</p>}
    </div>
  );
}

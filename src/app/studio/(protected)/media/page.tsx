import { CmsHeading } from "@/components/studio/ui";
import { CopyUrlButton, ConfirmDeleteButton } from "@/components/studio/client-buttons";
import { MediaUploader } from "@/components/studio/media-uploader";
import { deleteMedia } from "@/lib/actions/media";
import { requireEditor } from "@/lib/auth";

export default async function MediaPage() {
  const { supabase } = await requireEditor();
  const { data, error } = await supabase.storage.from("studio-media").list("marketing", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw new Error(`Unable to list assets: ${error.message}. Confirm the Phase 2 migration and storage bucket.`);
  const files = (data || []).filter(item => item.name && /\.(jpg|png|webp|avif)$/i.test(item.name));
  return <><CmsHeading title="Media library" description="Upload and manage approved public-site imagery. Copy image URLs into your content editors." />
    <MediaUploader />
    <div className="cms-surface"><div className="cms-section-heading"><h2>Uploaded images</h2><p>Refresh this page after uploading to see the latest image. Maximum 100 recent items shown.</p></div>
    <div className="cms-media-grid">{files.map(item => {
      const path = `marketing/${item.name}`;
      const { data: url } = supabase.storage.from("studio-media").getPublicUrl(path);
      return <div className="cms-media-card" key={path}>
        {/* Standard img is intentional for a user-supplied storage host that may change across environments. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url.publicUrl} alt="Uploaded media preview" loading="lazy"/>
        <div className="cms-media-meta"><small>{item.name}</small><a target="_blank" rel="noreferrer" href={url.publicUrl}>Open image ↗</a><CopyUrlButton url={url.publicUrl}/>
          <form action={deleteMedia}><input type="hidden" name="path" value={path}/><ConfirmDeleteButton label="Delete image" /></form>
        </div>
      </div>;
    })}</div>{!files.length && <p className="cms-empty">No images uploaded yet.</p>}</div>
  </>;
}

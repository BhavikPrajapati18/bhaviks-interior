import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { requireEditor } from "@/lib/auth";
import { journalDate } from "@/lib/journal";

export default async function JournalIndex() {
  const { supabase } = await requireEditor();
  const { data, error } = await supabase.from("journal_posts")
    .select("id,title,slug,is_published,published_at,updated_at")
    .order("updated_at", { ascending: false }).limit(200);
  if (error) throw new Error("Could not load articles: " + error.message);
  return <><CmsHeading title="Journal" description="Write, upload cover images, and publish editorial articles." action={<Link href="/studio/journal/new" className="btn btn-primary">New article +</Link>}/>
    <div className="cms-surface"><div className="journal-table-head"><span>Article</span><span>Status</span><span>Updated</span><span></span></div>
      {data?.length ? data.map(post => <div className="journal-table-row" key={post.id}><div><strong>{post.title}</strong><small>/journal/{post.slug}</small></div>
        <span className={post.is_published ? "cms-tag published" : "cms-tag"}>{post.is_published ? "Published" : "Draft"}</span>
        <span>{journalDate(post.updated_at)}</span><Link href={`/studio/journal/${post.id}`}>Edit ↗</Link></div>) : <p className="cms-empty">No articles yet. Create your first journal entry.</p>}
    </div></>;
}

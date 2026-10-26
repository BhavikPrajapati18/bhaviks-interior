import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { requireEditor } from "@/lib/auth";
export default async function ProcessIndex() {
  const { supabase } = await requireEditor();
  const { data, error } = await supabase.from("process_steps").select("id, title, is_published, display_order").order("display_order").order("title");
  if (error) throw new Error("Unable to load process content: " + error.message);
  return <><CmsHeading title="Design process" description="Edit the steps of your design process on the homepage." action={<Link href="/studio/process/new" className="btn btn-primary">Add step +</Link>}/>
  <div className="cms-surface"><div className="cms-list-header"><span>Content</span><span>Status</span><span>Order</span><span>Action</span></div>
  {data?.length ? data.map(item => <div className="cms-list-row" key={item.id}>
    <strong>{item.title}</strong><span className={item.is_published ? "cms-tag published" : "cms-tag"}>{item.is_published ? "Published" : "Draft"}</span>
    <span>{item.display_order}</span><Link href={`/studio/process/${item.id}`}>Edit ↗</Link>
  </div>) : <p className="cms-empty">Nothing here yet. Create your first step.</p>}
  </div></>;
}

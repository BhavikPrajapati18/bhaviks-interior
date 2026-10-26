import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { requireEditor } from "@/lib/auth";
export default async function ServicesIndex() {
  const { supabase } = await requireEditor();
  const { data, error } = await supabase.from("services").select("id, title, is_published, display_order").order("display_order").order("title");
  if (error) throw new Error("Unable to load services content: " + error.message);
  return <><CmsHeading title="Services" description="Manage your offered design services, categories and details." action={<Link href="/studio/services/new" className="btn btn-primary">Add service +</Link>}/>
  <div className="cms-surface"><div className="cms-list-header"><span>Content</span><span>Status</span><span>Order</span><span>Action</span></div>
  {data?.length ? data.map(item => <div className="cms-list-row" key={item.id}>
    <strong>{item.title}</strong><span className={item.is_published ? "cms-tag published" : "cms-tag"}>{item.is_published ? "Published" : "Draft"}</span>
    <span>{item.display_order}</span><Link href={`/studio/services/${item.id}`}>Edit ↗</Link>
  </div>) : <p className="cms-empty">Nothing here yet. Create your first service.</p>}
  </div></>;
}

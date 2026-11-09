import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsHeading } from "@/components/studio/ui";
import { EditorialEditor } from "@/components/studio/editorial-editor";
import { EditorialDeleteButton } from "@/components/studio/editorial-delete";
import { deleteEditorial } from "@/lib/actions/editorial";
import { editorialKinds, type EditorialKind } from "@/lib/editorial-studio";
import { requireEditor } from "@/lib/auth";

export async function EditorialIndex({ kind }: { kind: EditorialKind }) {
  const { supabase } = await requireEditor();
  const meta = editorialKinds[kind];
  const { data, error } = await supabase.from(meta.table).select(`id,${meta.label},is_published,display_order`).order("display_order").order(meta.label);
  if (error) throw new Error(`Unable to load ${meta.plural}: ${error.message}`);
  const list = (data ?? []) as unknown as Array<Record<string, string | number | boolean>>;
  return <><CmsHeading title={meta.plural} description={meta.description} action={<Link className="btn btn-primary" href={`/studio/${kind}/new`}>Add {meta.singular} +</Link>}/>
    <div className="cms-surface"><div className="cms-list-header"><span>Content</span><span>Status</span><span>Order</span><span>Action</span></div>
      {list.length ? list.map(item => <div className="cms-list-row" key={String(item.id)}><strong>{String(item[meta.label])}</strong><span className={item.is_published ? "cms-tag published" : "cms-tag"}>{item.is_published ? "Published" : "Draft"}</span><span>{item.display_order}</span><Link href={`/studio/${kind}/${item.id}`}>Edit ↗</Link></div>) : <p className="cms-empty">No items yet. Add an authentic record and publish when ready.</p>}
    </div></>;
}
export function EditorialNew({ kind }: { kind: EditorialKind }) {
  const meta = editorialKinds[kind];
  return <><Link href={`/studio/${kind}`} className="cms-back">← {meta.plural}</Link><CmsHeading title={`New ${meta.singular}`} description="Save as a draft until the content has been reviewed."/><EditorialEditor kind={kind}/></>;
}
export async function EditorialEdit({ kind, id }: { kind: EditorialKind; id: string }) {
  const { supabase } = await requireEditor();
  const meta = editorialKinds[kind];
  const { data, error } = await supabase.from(meta.table).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Unable to load ${meta.singular}: ${error.message}`);
  if (!data) notFound();
  return <><Link href={`/studio/${kind}`} className="cms-back">← {meta.plural}</Link><CmsHeading title={`Edit ${meta.singular}`} description="Save changes, publish, or return this record to draft."/>
    <EditorialEditor kind={kind} initial={data}/>
    <form action={deleteEditorial.bind(null, kind)} className="cms-danger-zone"><input type="hidden" name="id" value={id}/><div><strong>Delete {meta.singular}</strong><p>Deletion is permanent. Consider unpublishing instead.</p></div><EditorialDeleteButton /></form>
  </>;
}

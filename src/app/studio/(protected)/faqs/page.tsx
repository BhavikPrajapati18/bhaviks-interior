import Link from "next/link";
import { CmsHeading } from "@/components/studio/ui";
import { requireEditor } from "@/lib/auth";
export default async function FaqsIndex() {
  const { supabase } = await requireEditor();
  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, is_published, display_order")
    .order("display_order")
    .order("question");
  if (error) throw new Error("Unable to load faqs content: " + error.message);
  return (
    <>
      <CmsHeading
        title="FAQs"
        description="Create answers to the most common visitor questions."
        action={
          <Link href="/studio/faqs/new" className="btn btn-primary">
            Add faq +
          </Link>
        }
      />
      <div className="cms-surface">
        <div className="cms-list-header">
          <span>Content</span>
          <span>Status</span>
          <span>Order</span>
          <span>Action</span>
        </div>
        {data?.length ? (
          data.map((item) => (
            <div className="cms-list-row" key={item.id}>
              <strong>{item.question}</strong>
              <span
                className={item.is_published ? "cms-tag published" : "cms-tag"}
              >
                {item.is_published ? "Published" : "Draft"}
              </span>
              <span>{item.display_order}</span>
              <Link href={`/studio/faqs/${item.id}`}>Edit ↗</Link>
            </div>
          ))
        ) : (
          <p className="cms-empty">Nothing here yet. Create your first faq.</p>
        )}
      </div>
    </>
  );
}

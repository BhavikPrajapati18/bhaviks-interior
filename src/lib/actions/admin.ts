"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/access";

export type AdminFormState = { error: string; message: string };
const ok = (message: string): AdminFormState => ({ error: "", message });
const fail = (error: string): AdminFormState => ({ error, message: "" });
const uid = z.uuid();
const short = z.string().trim().min(2).max(160);
const optionalUuid = z.union([z.literal(""), uid]);
const dateOrBlank = z.union([z.literal(""), z.iso.date()]);

const leadSchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
  internal_notes: z.string().trim().max(4000),
  assigned_client_id: optionalUuid
});
export async function saveLead(_state: AdminFormState, form: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const id = uid.safeParse(form.get("id"));
  const parsed = leadSchema.safeParse(Object.fromEntries(form));
  if (!id.success || !parsed.success) return fail("Please verify the lead fields.");
  const { error } = await supabase.from("inquiries").update({
    status: parsed.data.status,
    internal_notes: parsed.data.internal_notes,
    assigned_client_id: parsed.data.assigned_client_id || null
  }).eq("id", id.data);
  if (error) return fail(error.message);
  revalidatePath("/studio/admin/leads");
  return ok("Lead updated.");
}

const accountSchema = z.object({
  user_id: uid, full_name: short.max(120), email: z.email().max(240)
});
export async function addClientAccount(_state: AdminFormState, form: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const parsed = accountSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid client information.");
  const { error } = await supabase.from("client_accounts").insert(parsed.data);
  if (error) return fail(error.code === "23505" ? "This user is already linked as a client." : error.message);
  revalidatePath("/studio/admin/clients");
  redirect("/studio/admin/clients");
}

const quoteSchema = z.object({
  client_user_id: uid,
  inquiry_id: optionalUuid,
  title: short,
  description: z.string().trim().max(5000),
  amount: z.coerce.number<number>().finite().min(0).max(999999999999),
  valid_until: dateOrBlank,
  status: z.enum(["draft", "shared", "accepted", "declined"])
});
export async function saveQuote(_state: AdminFormState, form: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const parsed = quoteSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid quote details.");
  const id = String(form.get("id") || "");
  if (id && !uid.safeParse(id).success) return fail("Invalid quote identifier.");
  const record = {
    ...parsed.data,
    inquiry_id: parsed.data.inquiry_id || null,
    valid_until: parsed.data.valid_until || null,
    currency: "INR"
  };
  if (record.inquiry_id) {
    const { data: lead } = await supabase.from("inquiries")
      .select("assigned_client_id").eq("id", record.inquiry_id).maybeSingle();
    if (!lead || (lead.assigned_client_id && lead.assigned_client_id !== record.client_user_id))
      return fail("Selected lead belongs to another client.");
  }
  const result = id
    ? await supabase.from("client_quotes").update(record).eq("id", id).select("id").single()
    : await supabase.from("client_quotes").insert(record).select("id").single();
  if (result.error || !result.data) return fail(result.error?.message || "Unable to save quotation.");
  revalidatePath("/studio/admin/quotes");
  revalidatePath("/client");
  if (!id) redirect(`/studio/admin/quotes/${result.data.id}`);
  return ok("Quote saved. 'Shared' means visible in the client portal; no email was sent.");
}

const projectSchema = z.object({
  client_user_id: uid,
  inquiry_id: optionalUuid,
  title: short,
  description: z.string().trim().max(5000),
  phase: z.string().trim().min(2).max(100),
  status: z.enum(["planning", "active", "on_hold", "completed"]),
  progress: z.coerce.number<number>().int().min(0).max(100),
  start_date: dateOrBlank,
  target_date: dateOrBlank
});
export async function saveClientProject(_state: AdminFormState, form: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const parsed = projectSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid project details.");
  const id = String(form.get("id") || "");
  if (id && !uid.safeParse(id).success) return fail("Invalid project identifier.");
  const record = {
    ...parsed.data,
    inquiry_id: parsed.data.inquiry_id || null,
    start_date: parsed.data.start_date || null,
    target_date: parsed.data.target_date || null
  };
  if (record.inquiry_id) {
    const { data: lead } = await supabase.from("inquiries")
      .select("assigned_client_id").eq("id", record.inquiry_id).maybeSingle();
    if (!lead || (lead.assigned_client_id && lead.assigned_client_id !== record.client_user_id))
      return fail("Selected lead belongs to another client.");
  }
  // An existing project retains its client; changing ownership would orphan private storage paths.
  if (id) {
    const { data: current } = await supabase.from("client_projects")
      .select("client_user_id").eq("id", id).maybeSingle();
    if (!current || current.client_user_id !== record.client_user_id)
      return fail("The client linked to an existing project cannot be changed.");
  }
  const result = id
    ? await supabase.from("client_projects").update(record).eq("id", id).select("id").single()
    : await supabase.from("client_projects").insert(record).select("id").single();
  if (result.error || !result.data) return fail(result.error?.message || "Unable to save client project.");
  revalidatePath("/studio/admin/projects");
  revalidatePath("/client");
  if (!id) redirect(`/studio/admin/projects/${result.data.id}`);
  return ok("Project saved.");
}

const fileTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
export async function uploadClientDocument(_state: AdminFormState, form: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const projectId = uid.safeParse(form.get("project_id"));
  const label = short.safeParse(form.get("label"));
  const file = form.get("file");
  if (!projectId.success || !label.success) return fail("Project and document title are required.");
  if (!(file instanceof File) || !fileTypes.has(file.type) || file.size < 1 || file.size > 10 * 1024 * 1024)
    return fail("Choose a PDF, JPG, PNG or WebP under 10 MB.");
  const { data: project } = await supabase.from("client_projects")
    .select("id,client_user_id").eq("id", projectId.data).maybeSingle();
  if (!project) return fail("Project not found.");
  const extension = ({ "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string,string>)[file.type];
  const path = `${project.client_user_id}/${project.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("client-documents")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return fail(uploadError.message);
  const { error } = await supabase.from("client_documents")
    .insert({ project_id: projectId.data, label: label.data, storage_path: path });
  if (error) {
    await supabase.storage.from("client-documents").remove([path]);
    return fail(error.message);
  }
  revalidatePath(`/studio/admin/projects/${project.id}`);
  revalidatePath(`/client/projects/${project.id}`);
  return ok("Private document uploaded.");
}

export async function deleteClientDocument(form: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const docId = uid.parse(form.get("document_id"));
  const { data: doc } = await supabase.from("client_documents")
    .select("id,project_id,storage_path").eq("id", docId).maybeSingle();
  if (!doc) throw new Error("Document not found.");
  const { error: storageError } = await supabase.storage.from("client-documents").remove([doc.storage_path]);
  if (storageError) throw new Error("Could not remove stored file.");
  const { error } = await supabase.from("client_documents").delete().eq("id", doc.id);
  if (error) throw new Error("Could not remove document record.");
  revalidatePath(`/studio/admin/projects/${doc.project_id}`);
  revalidatePath(`/client/projects/${doc.project_id}`);
}

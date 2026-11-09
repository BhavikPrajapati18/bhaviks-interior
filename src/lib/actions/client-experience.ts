"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, requireClient } from "@/lib/access";

export type ClientExperienceState = { error: string; message: string };
const fail = (error: string): ClientExperienceState => ({ error, message: "" });
const success = (message: string): ClientExperienceState => ({ error: "", message });

const contactSchema = z.object({
  phone: z.string().trim().max(20).refine((value) => !value || /^\+?[0-9()\-\s]{7,20}$/.test(value), "Enter a valid phone number."),
  city: z.string().trim().max(80),
  address: z.string().trim().max(350),
  preferred_contact_method: z.enum(["email", "phone", "whatsapp"]),
});

export async function saveClientContact(
  _state: ClientExperienceState,
  form: FormData,
): Promise<ClientExperienceState> {
  const { supabase, user } = await requireClient();
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid contact details.");
  const { error } = await supabase.from("client_contact_details")
    .upsert({ user_id: user.id, ...parsed.data }, { onConflict: "user_id" });
  if (error) return fail("Contact details could not be saved. Ensure migration 009 is applied.");
  revalidatePath("/client/profile");
  revalidatePath("/client");
  return success("Your contact details have been saved.");
}

const updateSchema = z.object({
  project_id: z.uuid(),
  kind: z.enum(["update", "milestone", "meeting", "handover"]),
  title: z.string().trim().min(2).max(160),
  details: z.string().trim().max(3000),
  visible_to_client: z.enum(["yes", "no"]),
});

export async function addProjectTimelineUpdate(
  _state: ClientExperienceState,
  form: FormData,
): Promise<ClientExperienceState> {
  const { supabase } = await requireAdmin();
  const parsed = updateSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Please check update details.");
  const { project_id, visible_to_client, ...fields } = parsed.data;
  const { data: project, error: projectError } = await supabase
    .from("client_projects").select("id").eq("id", project_id).maybeSingle();
  if (projectError || !project) return fail("Project not found.");
  const { error } = await supabase.from("client_project_updates").insert({
    project_id,
    ...fields,
    visible_to_client: visible_to_client === "yes",
  });
  if (error) return fail(error.message);
  revalidatePath(`/studio/admin/projects/${project_id}`);
  revalidatePath(`/client/projects/${project_id}`);
  revalidatePath("/client/notifications");
  return success(visible_to_client === "yes" ? "Update published to the client timeline." : "Internal update saved. Client cannot see it.");
}

export async function deleteProjectTimelineUpdate(form: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const updateId = z.uuid().parse(form.get("update_id"));
  const projectId = z.uuid().parse(form.get("project_id"));
  const { error } = await supabase.from("client_project_updates")
    .delete().eq("id", updateId).eq("project_id", projectId);
  if (error) throw new Error("Could not delete the project update.");
  revalidatePath(`/studio/admin/projects/${projectId}`);
  revalidatePath(`/client/projects/${projectId}`);
}

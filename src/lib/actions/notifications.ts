"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, requireClient } from "@/lib/access";

async function acknowledge(form: FormData, kind: "admin" | "client") {
  const { supabase, user } = kind === "admin" ? await requireAdmin() : await requireClient();
  const raw = String(form.get("notification_id") || "");
  const all = raw === "all";
  if (!all && !z.uuid().safeParse(raw).success) return;
  let query = supabase.from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_user_id", user.id).is("read_at", null);
  if (!all) query = query.eq("id", raw);
  const { error } = await query;
  if (error) throw new Error("Could not update notifications. Verify migration 006.");
  revalidatePath(kind === "admin" ? "/studio/admin/notifications" : "/client/notifications");
  revalidatePath(kind === "admin" ? "/studio/admin" : "/client");
}
export async function markAdminNotificationsRead(form: FormData): Promise<void> {
  await acknowledge(form, "admin");
}
export async function markClientNotificationsRead(form: FormData): Promise<void> {
  await acknowledge(form, "client");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireClient } from "@/lib/access";

export type ClientLoginState = { error: string };
export async function clientSignIn(_state: ClientLoginState, form: FormData): Promise<ClientLoginState> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Configure Supabase first." };
  const email = z.email().safeParse(form.get("email"));
  const password = String(form.get("password") || "");
  if (!email.success || !password) return { error: "Enter a valid email and password." };
  const { error } = await supabase.auth.signInWithPassword({ email: email.data, password });
  if (error) return { error: error.message };
  redirect("/client");
}
export async function clientSignOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/client/login");
}
export async function respondToQuote(form: FormData): Promise<void> {
  const { supabase } = await requireClient();
  const id = z.uuid().parse(form.get("id"));
  const decision = z.enum(["accepted", "declined"]).parse(form.get("decision"));
  const { error } = await supabase.rpc("respond_to_client_quote", { p_quote_id: id, p_decision: decision });
  if (error) throw new Error("Could not update the quote. It may have expired or already been answered.");
  revalidatePath("/client");
  revalidatePath(`/client/quotes/${id}`);
  redirect(`/client/quotes/${id}`);
}

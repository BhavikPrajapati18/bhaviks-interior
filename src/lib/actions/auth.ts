"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signIn(_state: { error: string }, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: "Configure your new Supabase project first." };
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Email and password are required." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Invalid credentials or unconfirmed account." };
  redirect("/studio");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/studio/login");
}

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/studio/login");
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/studio/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/studio/forbidden");
  return { supabase, user };
}

export async function requireClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/client/login");
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/client/login");
  const { data: account } = await supabase.from("client_accounts")
    .select("user_id,full_name,email").eq("user_id", user.id).maybeSingle();
  if (!account) redirect("/client/pending");
  return { supabase, user, account };
}

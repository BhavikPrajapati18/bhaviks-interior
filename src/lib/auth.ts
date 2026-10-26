import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireEditor() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/studio/login");
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/studio/login");
  const { data: profile, error: roleError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (roleError || !profile || !["admin", "marketing"].includes(profile.role)) redirect("/studio/forbidden");
  return { supabase, user };
}

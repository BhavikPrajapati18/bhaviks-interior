import { requireAdmin } from "@/lib/access";

export async function getAdminReferences() {
  const { supabase } = await requireAdmin();
  const [clientResult, leadResult] = await Promise.all([
    supabase.from("client_accounts").select("user_id,full_name,email").order("full_name"),
    supabase.from("inquiries").select("id,full_name,email,assigned_client_id").order("created_at", { ascending: false }).limit(250)
  ]);
  if (clientResult.error || leadResult.error) throw new Error("Unable to load client/lead selections. Apply migration 003.");
  return { clients: clientResult.data ?? [], leads: leadResult.data ?? [] };
}
export function price(amount: number | string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(amount));
}
export function humanDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(`${value.slice(0,10)}T12:00:00Z`).toLocaleDateString("en-IN", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" });
}

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { generateQuotePdf } from "@/lib/quotes/quote-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response("Not found", { status: 404 });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new Response("Not configured", { status: 503 });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return new Response("Sign in required", { status: 401 });

  const [profileResult, quoteResult] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("client_quotes")
      .select("id,title,description,amount,currency,status,created_at,valid_until,client_user_id")
      .eq("id", id).maybeSingle()
  ]);
  const isAdmin = profileResult.data?.role === "admin";
  const quote = quoteResult.data;
  // RLS is active. Enforce owner + sharing status again at the route boundary.
  if (quoteResult.error || !quote || (!isAdmin && (
    quote.client_user_id !== user.id || !["shared", "accepted", "declined"].includes(quote.status)
  ))) return new Response("Not found", { status: 404 });

  const { data: client, error: clientError } = await supabase.from("client_accounts")
    .select("full_name,email").eq("user_id", quote.client_user_id).maybeSingle();
  if (clientError || !client) return new Response("Not found", { status: 404 });
  const pdf = await generateQuotePdf(quote, client);
  const bytes = Uint8Array.from(pdf);
  return new Response(bytes.buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quotation-${id.slice(0, 8)}.pdf"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(240),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(15).max(3000),
  website: z.string().optional() // honeypot: should always be empty
});
export async function sendInquiry(_state: { message: string; error: string }, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "", error: parsed.error.issues[0]?.message || "Please check your details." };
  if (parsed.data.website) return { message: "", error: "Unable to submit your request." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { message: "", error: "Enquiries are not connected yet. Configure the fresh database first." };
  const { error } = await supabase.from("inquiries").insert({
    full_name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    message: parsed.data.message
  });
  if (error) return { message: "", error: "We couldn't submit your request. Please try again." };
  return { message: "Thanks. Your enquiry has been received.", error: "" };
}

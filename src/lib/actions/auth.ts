"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SignInState = { error: string };

export async function signIn(
  _state: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    console.error("[Studio login] Supabase client setup failed:", error);
    return { error: "Unable to initialize Supabase. Check the server terminal." };
  }

  if (!supabase) {
    return { error: "Configure your new Supabase project in .env.local first." };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const code = error.code || `http_${error.status || "unknown"}`;
      // Diagnostic information only. Never log passwords, access tokens or API keys.
      console.error("[Studio login] Supabase sign-in failed:", {
        code,
        status: error.status,
        message: error.message,
      });

      if (code === "email_not_confirmed") {
        return { error: "Email is not confirmed. Confirm it in Supabase Authentication → Users." };
      }

      if (code === "invalid_credentials") {
        return {
          error:
            "Invalid email/password. Verify that .env.local points to the same Supabase project where you created this user.",
        };
      }

      if (code === "email_provider_disabled" || code === "provider_disabled") {
        return { error: "Email/password login is disabled in Supabase Auth provider settings." };
      }

      return {
        error:
          process.env.NODE_ENV === "development"
            ? `Supabase Auth error (${code}): ${error.message}`
            : "Authentication failed. Please try again or contact the administrator.",
      };
    }
  } catch (error) {
    console.error("[Studio login] Supabase request failed:", error);
    return { error: "Cannot reach Supabase Auth. Check project URL, network and terminal logs." };
  }

  redirect("/studio");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/studio/login");
}

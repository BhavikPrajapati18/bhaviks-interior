"use server";
import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/auth";
import { z } from "zod";

export async function deleteMedia(data: FormData) {
  const { supabase } = await requireEditor();
  const path = z.string().regex(/^marketing\/[a-f0-9-]+\.(jpg|png|webp|avif)$/).parse(data.get("path"));
  const { error } = await supabase.storage.from("studio-media").remove([path]);
  if (error) throw new Error("Unable to remove asset");
  revalidatePath("/studio/media");
}

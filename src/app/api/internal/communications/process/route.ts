import { NextRequest, NextResponse } from "next/server";
import { processCommunicationQueue } from "@/lib/communications/dispatch";
import { timingSafeEqual } from "node:crypto";
export const runtime = "nodejs";

export async function POST(request:NextRequest) {
  const expected=process.env.COMMUNICATIONS_CRON_SECRET;
  const supplied=request.headers.get("authorization")?.replace(/^Bearer /i,"") || "";
  const providedBytes=Buffer.from(supplied);
  const expectedBytes=Buffer.from(expected || "");
  if (!expected || expected.length<32 || providedBytes.length!==expectedBytes.length ||
      !timingSafeEqual(providedBytes,expectedBytes)) {
    return NextResponse.json({error:"Unauthorized"},{status:401});
  }
  try {
    return NextResponse.json(await processCommunicationQueue(5));
  } catch (error) {
    console.error("[communications] dispatch error",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"Dispatch failed"},{status:500});
  }
}

import { NextResponse } from "next/server";
import { query } from "@/server/db";

export const dynamic = "force-dynamic";

/** GET /api/health → { ok, database } — used to confirm the DB connection. */
export async function GET() {
  try {
    await query("SELECT 1");
    return NextResponse.json({ ok: true, database: "up" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ ok: false, database: "down", message }, { status: 503 });
  }
}

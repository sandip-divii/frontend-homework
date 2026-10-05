import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/server/auth/session";
import { jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/auth/me → 200 { user } or 401. */
export async function GET(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) return jsonError(401, "Not signed in.");
  return NextResponse.json({ user });
}

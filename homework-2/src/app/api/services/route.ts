import { NextResponse, type NextRequest } from "next/server";
import { canManageServices, ROLE_MESSAGES } from "@/lib/auth/roles";
import { listQuerySchema, serviceInputSchema } from "@/lib/validation/service";
import { getSessionFromRequest } from "@/server/auth/session";
import { jsonError, readJson, searchParamsToObject, validationError } from "@/server/http";
import { createService, listServices } from "@/server/repositories/expertServices";

export const dynamic = "force-dynamic";

/**
 * GET /api/services?category=all|typo|cover|internal|correction&q=&sort=recommended|newest|priceAsc|priceDesc|rating&page=1&pageSize=12
 * 200 PagedResult<ExpertService> · 422 on a bad query
 */
export async function GET(req: NextRequest) {
  const parsed = listQuerySchema.safeParse(searchParamsToObject(req.nextUrl.searchParams));
  if (!parsed.success) return validationError(parsed.error);
  const { category, q, sort, page, pageSize } = parsed.data;
  const result = await listServices({ category, keyword: q, sort, page, pageSize });
  return NextResponse.json(result);
}

/**
 * POST /api/services  ServiceInput  (expert / admin only)
 * 201 ExpertService · 401 not signed in · 403 wrong role · 422 { error.fields }
 */
export async function POST(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) return jsonError(401, ROLE_MESSAGES.loginRequired);
  if (!canManageServices(user)) return jsonError(403, ROLE_MESSAGES.forbidden);

  const parsed = serviceInputSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const created = await createService(parsed.data, user.id);
  return NextResponse.json(created, { status: 201 });
}

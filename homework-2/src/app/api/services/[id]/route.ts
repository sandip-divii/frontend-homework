import { NextResponse, type NextRequest } from "next/server";
import { canManageServices, ROLE_MESSAGES } from "@/lib/auth/roles";
import { serviceInputSchema } from "@/lib/validation/service";
import { getSessionFromRequest } from "@/server/auth/session";
import { jsonError, parseId, readJson, validationError } from "@/server/http";
import { deleteService, getServiceById, updateService } from "@/server/repositories/expertServices";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

async function requireManager(req: NextRequest) {
  const user = await getSessionFromRequest(req);
  if (!user) return { error: jsonError(401, ROLE_MESSAGES.loginRequired) };
  if (!canManageServices(user)) return { error: jsonError(403, ROLE_MESSAGES.forbidden) };
  return { user };
}

/** GET /api/services/:id → 200 ExpertService · 400 · 404 */
export async function GET(_req: NextRequest, { params }: Context) {
  const id = parseId((await params).id);
  if (!id) return jsonError(400, "Invalid service id.");
  const service = await getServiceById(id);
  if (!service) return jsonError(404, "Service not found.");
  return NextResponse.json(service);
}

/** PUT /api/services/:id  ServiceInput (expert / admin) → 200 ExpertService · 401 · 403 · 404 · 422 */
export async function PUT(req: NextRequest, { params }: Context) {
  const auth = await requireManager(req);
  if ("error" in auth) return auth.error;

  const id = parseId((await params).id);
  if (!id) return jsonError(400, "Invalid service id.");

  const parsed = serviceInputSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const updated = await updateService(id, parsed.data);
  if (!updated) return jsonError(404, "Service not found.");
  return NextResponse.json(updated);
}

/** DELETE /api/services/:id (expert / admin) → 204 · 401 · 403 · 404 */
export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = await requireManager(req);
  if ("error" in auth) return auth.error;

  const id = parseId((await params).id);
  if (!id) return jsonError(400, "Invalid service id.");

  const removed = await deleteService(id);
  if (!removed) return jsonError(404, "Service not found.");
  return new NextResponse(null, { status: 204 });
}

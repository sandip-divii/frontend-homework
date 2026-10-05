import { NextResponse, type NextRequest } from "next/server";
import { serviceInputSchema } from "@/lib/validation/service";
import { getSessionFromRequest } from "@/server/auth/session";
import { jsonError, parseId, readJson, validationError } from "@/server/http";
import { deleteService, getServiceById, updateService } from "@/server/repositories/expertServices";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

/** GET /api/services/:id → 200 ExpertService · 404 */
export async function GET(_req: NextRequest, { params }: Context) {
  const id = parseId((await params).id);
  if (!id) return jsonError(400, "Invalid service id.");
  const service = await getServiceById(id);
  if (!service) return jsonError(404, "Service not found.");
  return NextResponse.json(service);
}

/** PUT /api/services/:id  ServiceInput (signed in only) → 200 ExpertService · 401 · 404 · 422 */
export async function PUT(req: NextRequest, { params }: Context) {
  const user = await getSessionFromRequest(req);
  if (!user) return jsonError(401, "Please log in to edit a service.");

  const id = parseId((await params).id);
  if (!id) return jsonError(400, "Invalid service id.");

  const parsed = serviceInputSchema.safeParse(await readJson(req));
  if (!parsed.success) return validationError(parsed.error);

  const updated = await updateService(id, parsed.data);
  if (!updated) return jsonError(404, "Service not found.");
  return NextResponse.json(updated);
}

/** DELETE /api/services/:id (signed in only) → 204 · 401 · 404 */
export async function DELETE(req: NextRequest, { params }: Context) {
  const user = await getSessionFromRequest(req);
  if (!user) return jsonError(401, "Please log in to delete a service.");

  const id = parseId((await params).id);
  if (!id) return jsonError(400, "Invalid service id.");

  const removed = await deleteService(id);
  if (!removed) return jsonError(404, "Service not found.");
  return new NextResponse(null, { status: 204 });
}

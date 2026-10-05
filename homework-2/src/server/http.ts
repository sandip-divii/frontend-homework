import { NextResponse } from "next/server";
import { z, type ZodError } from "zod";

/** Error envelope shared by every route handler: { error: { message, fields? } } */
export type FieldErrors = Record<string, string[]>;

export function jsonError(status: number, message: string, fields?: FieldErrors) {
  return NextResponse.json({ error: { message, ...(fields ? { fields } : {}) } }, { status });
}

export function validationError(error: ZodError) {
  const flat = z.flattenError(error);
  const fields = Object.fromEntries(
    Object.entries(flat.fieldErrors).filter(([, messages]) => Array.isArray(messages) && messages.length > 0),
  ) as FieldErrors;
  return jsonError(422, "Please check the highlighted fields.", fields);
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Positive integer route param or null. */
export function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Query string → plain object, dropping empty values so zod defaults apply. */
export function searchParamsToObject(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    if (value !== "") out[key] = value;
  });
  return out;
}

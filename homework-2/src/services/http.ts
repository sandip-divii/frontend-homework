/** Client-side fetch wrapper for our own API. Components never call this directly — services do. */

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly fields?: FieldErrors;

  constructor(status: number, message: string, fields?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

interface ErrorEnvelope {
  error?: { message?: string; fields?: FieldErrors };
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(path, { ...init, headers, credentials: "same-origin" });

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const envelope = (data ?? {}) as ErrorEnvelope;
    throw new ApiError(res.status, envelope.error?.message ?? `Request failed (${res.status})`, envelope.error?.fields);
  }
  return data as T;
}

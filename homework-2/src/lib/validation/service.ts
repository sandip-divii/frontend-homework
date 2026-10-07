import { z } from "zod";

// Shared by the API (authoritative) and the forms (early feedback) so both sides agree.
export const SERVICE_CATEGORIES = ["typo", "cover", "internal", "correction"] as const;
export const SORT_IDS = ["recommended", "newest", "priceAsc", "priceDesc", "rating"] as const;

export const serviceInputSchema = z.object({
  category: z.enum(SERVICE_CATEGORIES, { error: "Choose a category." }),
  title: z.string().trim().min(2, "Title must be at least 2 characters.").max(120, "Title must be 120 characters or fewer."),
  author: z.string().trim().min(1, "Author is required.").max(80, "Author must be 80 characters or fewer."),
  description: z.string().trim().max(2000, "Description must be 2000 characters or fewer.").nullable().optional(),
  // Accepts a number (API JSON) or a string (form input). Checked step by step so each rule has its own message
  // and an empty field reads "required" instead of being coerced to 0.
  price: z.unknown().transform((value, ctx) => {
    const fail = (message: string) => {
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    };
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) return fail("Price is required.");
    const n = typeof value === "number" ? value : Number(String(value).trim());
    if (!Number.isFinite(n)) return fail("Price must be a number.");
    if (!Number.isInteger(n)) return fail("Price must be a whole number.");
    if (n < 0) return fail("Price cannot be negative.");
    if (n > 100_000_000) return fail("Price is too large.");
    return n;
  }),
  thumbnail: z.string().trim().max(255).optional(),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;

export const listQuerySchema = z.object({
  category: z.enum(["all", ...SERVICE_CATEGORIES]).default("all"),
  q: z.string().trim().max(100).default(""),
  sort: z.enum(SORT_IDS).default("recommended"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

export type ListQuery = z.infer<typeof listQuerySchema>;

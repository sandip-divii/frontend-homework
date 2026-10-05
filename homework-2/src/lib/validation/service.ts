import { z } from "zod";

// Shared by the API (authoritative) and the forms (early feedback) so both sides agree.
export const SERVICE_CATEGORIES = ["typo", "cover", "internal", "correction"] as const;
export const SORT_IDS = ["recommended", "newest", "priceAsc", "priceDesc", "rating"] as const;

export const serviceInputSchema = z.object({
  category: z.enum(SERVICE_CATEGORIES, { error: "Choose a category." }),
  title: z.string().trim().min(2, "Title must be at least 2 characters.").max(120, "Title must be 120 characters or fewer."),
  author: z.string().trim().min(1, "Author is required.").max(80, "Author must be 80 characters or fewer."),
  description: z.string().trim().max(2000, "Description must be 2000 characters or fewer.").nullable().optional(),
  price: z.coerce
    .number({ error: "Price must be a number." })
    .int("Price must be a whole number.")
    .min(0, "Price cannot be negative.")
    .max(100_000_000, "Price is too large."),
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

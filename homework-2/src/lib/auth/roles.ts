import type { PublicUser, UserRole } from "@/types/user";

/** Roles allowed to create, edit and delete expert services. Shared by the API and the UI. */
export const MANAGER_ROLES: readonly UserRole[] = ["expert", "admin"];

export function canManageServices(user: PublicUser | null | undefined): boolean {
  return Boolean(user && MANAGER_ROLES.includes(user.role));
}

export const ROLE_MESSAGES = {
  loginRequired: "Please log in to continue.",
  forbidden: "Only experts and admins can manage services.",
} as const;

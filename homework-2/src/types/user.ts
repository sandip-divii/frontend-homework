export type UserRole = "user" | "expert" | "admin";

/** What the API exposes about a user — never the password hash. */
export interface PublicUser {
  id: number;
  loginId: string;
  name: string;
  role: UserRole;
}

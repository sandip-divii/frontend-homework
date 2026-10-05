/**
 * Temporary demo accounts for Homework 1.
 * Mock data only — there is no real backend. Replace with the auth API when it exists.
 */
export interface MockUser {
  id: string;
  password: string;
  name: string;
}

export const MOCK_USERS: readonly MockUser[] = [
  { id: "bookplate", password: "Bookplate2026!", name: "Bookplate Tester" },
  { id: "reviewer", password: "Review2026!", name: "Homework Reviewer" },
];

export function findUser(id: string): MockUser | undefined {
  const needle = id.trim().toLowerCase();
  return MOCK_USERS.find((u) => u.id === needle);
}

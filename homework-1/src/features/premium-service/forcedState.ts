export type ForcedState = "loading" | "empty" | "error";

const FORCED_STATES: readonly ForcedState[] = ["loading", "empty", "error"];

/** `?state=loading|empty|error` pins the list to one state for QA screenshots. */
export function parseForcedState(raw: string | string[] | undefined): ForcedState | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return FORCED_STATES.find((s) => s === value);
}

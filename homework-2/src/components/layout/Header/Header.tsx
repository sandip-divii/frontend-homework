import { getSession } from "@/server/auth/session";
import { HeaderView } from "./HeaderView";

/** Server wrapper: verifies the session cookie against the database and renders the matching icon set. */
export async function Header() {
  const user = await getSession();
  return <HeaderView userName={user?.name} />;
}

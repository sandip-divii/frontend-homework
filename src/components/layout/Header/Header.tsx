import { getSession } from "@/lib/auth/session";
import { HeaderView } from "./HeaderView";

/** Server wrapper: reads the mock session cookie and renders the matching icon set. */
export async function Header() {
  const user = await getSession();
  return <HeaderView userName={user?.name} />;
}

import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;
    return !!session;
  } catch {
    return false;
  }
}

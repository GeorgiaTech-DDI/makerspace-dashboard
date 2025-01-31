// app/api/auth/session/route.ts
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get("gt_session");

  return Response.json({
    user: sessionCookie?.value || null,
    isAuthenticated: !!sessionCookie?.value,
  });
}

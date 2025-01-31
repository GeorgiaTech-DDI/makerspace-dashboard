// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCasLogoutUrl, getBaseUrl } from "@/lib/cas";
import { getCookieConfig } from "@/lib/cookie";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const service =
    searchParams.get("service") || `${getBaseUrl(request)}/account`;
  const host = request.headers.get("host");

  // Get the CAS logout URL
  const casLogoutUrl = getCasLogoutUrl(service);

  // Create response with redirect
  const response = NextResponse.redirect(casLogoutUrl);

  // Get cookie configuration based on environment
  const cookieConfig = getCookieConfig(host);

  // Explicitly delete the cookie with the same configuration used to set it
  response.cookies.set("gt_session", "", {
    ...cookieConfig,
    maxAge: 0,
    expires: new Date(0),
  });

  // Add CORS headers for production environment
  if (host?.includes("amplifyapp.com")) {
    const origin = request.headers.get("origin");
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  return response;
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  const host = request.headers.get("host");

  if (host?.includes("amplifyapp.com")) {
    const origin = request.headers.get("origin");
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  return response;
}

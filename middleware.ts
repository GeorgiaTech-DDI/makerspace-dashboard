// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth3DPOS, authSUMS, checkSession3DPOS } from "./lib/auth";
import { getCasLoginUrl, getBaseUrl, validateCasTicket } from "./lib/cas";
import { getCookieConfig } from "@/lib/cookie";

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  "/pi": ["PI"],
  "/dashboard": ["PI", "STAFF", "STUDENT"],
} as const;

async function validateUserRole(username: string): Promise<string[]> {
  const userRoles: Record<string, string[]> = {
    gburdell3: ["PI"],
  };
  return userRoles[username] || ["STUDENT"];
}

export async function middleware(request: NextRequest) {
  // Handle existing auth routes for 3DPOS and SUMS
  if (request.nextUrl.pathname.startsWith("/api/3DPOS")) {
    return handle3DPOSAuth(request);
  } else if (request.nextUrl.pathname.startsWith("/api/SUMS")) {
    return handleSUMSAuth(request);
  }

  const session = request.cookies.get("gt_session");
  const ticket = request.nextUrl.searchParams.get("ticket");
  const currentPath = request.nextUrl.pathname;
  const host = request.headers.get("host");

  // Check if this is a protected route
  const isProtectedRoute = Object.keys(PROTECTED_ROUTES).some((path) =>
    currentPath.startsWith(path),
  );

  // Get clean service URL (without ticket parameter)
  const url = new URL(request.url);
  url.searchParams.delete("ticket");
  const serviceUrl = url.toString();

  // If we have a ticket, validate it regardless of route
  if (ticket) {
    console.log("Processing ticket:", ticket);
    try {
      const validation = await validateCasTicket(ticket, serviceUrl);
      console.log("Validation result:", validation);

      if (validation.success) {
        const username = validation.username;

        // If this is a protected route, check authorization
        if (isProtectedRoute) {
          const pathToCheck = Object.keys(PROTECTED_ROUTES).find((path) =>
            currentPath.startsWith(path),
          );
          if (pathToCheck) {
            const requiredRoles =
              PROTECTED_ROUTES[pathToCheck as keyof typeof PROTECTED_ROUTES];
            const userRoles = await validateUserRole(username);
            const hasRequiredRole = requiredRoles.some((role) =>
              userRoles.includes(role),
            );

            if (!hasRequiredRole) {
              return NextResponse.redirect(
                new URL("/unauthorized", request.url),
              );
            }
          }
        }

        // Create response with clean URL
        const response = NextResponse.redirect(serviceUrl);
        const cookieConfig = getCookieConfig(host);
        console.log("Setting cookie with config:", cookieConfig);
        response.cookies.set("gt_session", username, cookieConfig);
        // Add CORS headers for Amplify environment
        if (host?.includes("amplifyapp.com")) {
          response.headers.set("Access-Control-Allow-Credentials", "true");
          response.headers.set(
            "Access-Control-Allow-Origin",
            request.headers.get("origin") || "*",
          );
        }

        console.log("Setting cookie and redirecting to:", serviceUrl);
        return response;
      } else {
        console.log("Ticket validation failed");
        // For protected routes, redirect to unauthorized. For others, just continue
        if (isProtectedRoute) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }
    } catch (error) {
      console.error("CAS validation error:", error);
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // If this is a protected route and we have no valid session, redirect to unauthorized
  if (isProtectedRoute && !session) {
    console.log("Protected route with no session, redirecting to unauthorized");
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // If we have a session and it's a protected route, validate the role
  if (isProtectedRoute && session) {
    const userRoles = await validateUserRole(session.value);
    const pathToCheck = Object.keys(PROTECTED_ROUTES).find((path) =>
      currentPath.startsWith(path),
    );
    if (pathToCheck) {
      const requiredRoles =
        PROTECTED_ROUTES[pathToCheck as keyof typeof PROTECTED_ROUTES];
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role),
      );

      if (!hasRequiredRole) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // For non-protected routes or valid sessions, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/3DPOS/:path*",
    "/api/SUMS/:path*",
    "/pi/:path*",
    "/dashboard/:path*",
    "/account",
  ],
};

async function handle3DPOSAuth(request: NextRequest) {
  try {
    console.log("Attempting 3DPOS authentication");
    let session = request.headers.get("x-printer-session");

    if (!session) {
      console.log("No session found, authenticating...");
      session = await auth3DPOS();
    } else {
      console.log("Checking existing session...");
      const isValid = await checkSession3DPOS(session);
      if (!isValid) {
        console.log("Session invalid, re-authenticating...");
        session = await auth3DPOS();
      }
    }

    if (!session) {
      throw new Error("Authentication flow failed");
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-printer-session", session);
    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  }
}

async function handleSUMSAuth(request: NextRequest) {
  try {
    const token = await authSUMS();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-sums-token", token);
    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  }
}

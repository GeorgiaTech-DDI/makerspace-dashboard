// lib/cookie.ts
export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  path: string;
  domain?: string;
}

export function getCookieConfig(host: string | null): CookieConfig {
  const isProduction = process.env.NODE_ENV === "production";
  const isDev = !isProduction;

  // Parse domain from host
  const domain = host ? host.split(":")[0] : undefined;
  const isLocalhost = domain === "localhost";
  const isAmplifyDomain = domain?.includes("amplifyapp.com");

  return {
    httpOnly: true,
    secure: isProduction || isAmplifyDomain || false,
    sameSite: isProduction && !isLocalhost ? "none" : "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
    domain: isAmplifyDomain ? domain : undefined,
  };
}

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

// In-memory sliding window rate limits (ephemeral per Edge Container Instance)
interface RequestLog {
  apiTimestamps: number[];
  actionTimestamps: number[];
}

const ipRequests = new Map<string, RequestLog>();
const WINDOW_MS = 60000; // 1 minute
const MAX_API_LIMIT = 30; // Max 30 API requests per minute
const MAX_ACTION_LIMIT = 15; // Max 15 Server Action submissions per minute

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 1. Skip static assets, images, next-specific calls
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path.match(/\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff2?|pdf)$/)
  ) {
    return await createClient(request);
  }

  // 2. Extract Client IP
  const ip =
    request.ip ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const now = Date.now();
  let log = ipRequests.get(ip);
  if (!log) {
    log = { apiTimestamps: [], actionTimestamps: [] };
    ipRequests.set(ip, log);
  }

  // Inline cleanup of timestamps older than WINDOW_MS
  log.apiTimestamps = log.apiTimestamps.filter((t) => now - t < WINDOW_MS);
  log.actionTimestamps = log.actionTimestamps.filter((t) => now - t < WINDOW_MS);

  // 3. Check for Server Action Calls (Next-Action header)
  const isServerAction = request.headers.has("Next-Action");

  if (isServerAction) {
    if (log.actionTimestamps.length >= MAX_ACTION_LIMIT) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Too many form submissions. Please slow down and try again in a minute.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
    log.actionTimestamps.push(now);
  }

  // 4. Check for API Routes (/api/*)
  const isApiRoute = path.startsWith("/api/");
  if (isApiRoute) {
    if (log.apiTimestamps.length >= MAX_API_LIMIT) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "API rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
    log.apiTimestamps.push(now);
  }

  return await createClient(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30; // 30 Days (2,592,000 seconds)

export const createClient = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const isDeleting = !value || value === "";
            const cookieOptions = {
              ...options,
              maxAge: isDeleting ? 0 : THIRTY_DAYS_IN_SECONDS,
              sameSite: "lax" as const,
              path: "/",
            };
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, cookieOptions);
          });
        },
      },
    },
  );

  // IMPORTANT: This triggers cookie refresh and ensures persistent sessions remain active
  await supabase.auth.getUser();

  return supabaseResponse;
};

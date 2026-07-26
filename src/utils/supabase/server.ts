import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30; // 30 Days (2,592,000 seconds)

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const isDeleting = !value || value === "";
              cookieStore.set(name, value, {
                ...options,
                maxAge: isDeleting ? 0 : THIRTY_DAYS_IN_SECONDS,
                sameSite: "lax",
                path: "/",
              });
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    },
  );
};

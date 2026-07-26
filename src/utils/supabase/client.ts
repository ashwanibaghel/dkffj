import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30; // 30 Days

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookieOptions: {
        maxAge: THIRTY_DAYS_IN_SECONDS,
        sameSite: "lax",
        path: "/",
      },
    }
  );

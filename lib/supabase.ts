import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service role key.
 * NEVER import this into client components — it bypasses RLS.
 * Use only inside API routes / server actions / the cron job.
 */
export function getServiceSupabase(): SupabaseClient {
  if (serviceClient) return serviceClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  serviceClient = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  return serviceClient;
}

/**
 * Browser-safe Supabase client using the anon key.
 * Fine to use in client components for read-only dashboard queries,
 * as long as RLS policies are tightened before real-world use
 * (see supabase/migrations/001_init.sql).
 */
export function getBrowserSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anonKey);
}

import { createBrowserClient } from '@supabase/ssr';

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    console.log('Creating new Supabase client');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      'SUPABASE_ANON_KEY exists:',
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { serverConfig } from '@/config';

/**
 * Creates a Supabase server client with cookie handling for Next.js
 * This should be called in Server Components, Server Actions, or Route Handlers
 */
export async function getSupabaseClient() {
  const cookieStore = await cookies();

  if (!serverConfig.SUPABASE_URL || !serverConfig.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY must be defined',
    );
  }

  const client = createServerClient(serverConfig.SUPABASE_URL, serverConfig.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  console.log('Supabase server client created');
  return client;
}

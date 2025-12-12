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

/**
 * Execute a query using Supabase's query builder
 */
export async function executeQuery<T = Record<string, any>>(
  tableName: string,
  options?: {
    select?: string;
    filter?: (query: any) => any;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  },
): Promise<{
    data: T[] | null;
    error: any;
    count: number | null;
  }> {
  const client = await getSupabaseClient();
  console.log(
    `Executing Supabase query on table: ${tableName}`,
    options ? `with options: ${JSON.stringify(options)}` : '',
  );

  try {
    let query = client.from(tableName).select(options?.select || '*', { count: 'exact' });

    // Apply filter if provided
    if (options?.filter) {
      query = options.filter(query);
    }

    // Apply ordering if provided
    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }

    // Apply limit if provided
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(`Query failed on table: ${tableName}`, error);
      return {
        data: null,
        error,
        count: null,
      };
    }

    console.log(`Query completed on table: ${tableName} (${data?.length || 0} rows)`);
    return {
      data: data as T[] | null,
      error: null,
      count,
    };
  } catch (error) {
    console.error(`Error executing query on table: ${tableName}`, error);
    return {
      data: null,
      error,
      count: null,
    };
  }
}

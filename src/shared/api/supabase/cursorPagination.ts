import type { PostgrestQueryBuilder } from '@supabase/postgrest-js';

export interface CursorPaginationParams {
  limit?: number;
  cursor?: string;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  total: number | null;
}

export async function paginateCursor<T extends Record<string, unknown>>(
  query: PostgrestQueryBuilder<any, any, any>,
  table: string,
  params: CursorPaginationParams,
): Promise<CursorPaginationResult<T>> {
  const limit = Math.min(params.limit ?? 50, 500);
  const sortField = params.sortField ?? 'created_at';
  const sortDir = params.sortDir ?? 'desc';

  let baseQuery = query
    .select('*', { count: 'estimated' })
    .order(sortField, { ascending: sortDir === 'asc' })
    .order('id', { ascending: sortDir === 'asc' })
    .limit(limit + 1);

  if (params.cursor) {
    const op = sortDir === 'asc' ? 'gt' : 'lt';
    baseQuery = baseQuery.or(`${sortField}.${op}.${params.cursor},and(${sortField}.eq.${params.cursor},id.${op}.${params.cursor})`);
  }

  const { data, error, count } = await baseQuery;

  if (error) throw error;

  const rows = (data || []) as T[];
  const hasMore = rows.length > limit;
  const result: T[] = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor: string | null = hasMore
    ? String(result[result.length - 1]?.[sortField === 'id' ? 'id' : (sortField as keyof T)] ?? '')
    : null;

  return { data: result, nextCursor, total: count };
}

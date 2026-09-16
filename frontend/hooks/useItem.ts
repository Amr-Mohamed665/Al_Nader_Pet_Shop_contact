'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { itemsService } from '@/services/items.service';
import type { Item } from '@/types';

interface UseItemReturn {
  item: Item | null;
  loading: boolean;
  error: string | null;
  refetch: UseQueryResult<Item | null>['refetch'];
}

export default function useItem(id: string | null | undefined): UseItemReturn {
  const query = useQuery({
    queryKey: ['item', id],
    queryFn: async (): Promise<Item | null> => {
      if (!id) return null;
      const res = await itemsService.getById(id);
      return res.success && res.data ? res.data : null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    item: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error.message || 'Item not found.') : null,
    refetch: query.refetch,
  };
}

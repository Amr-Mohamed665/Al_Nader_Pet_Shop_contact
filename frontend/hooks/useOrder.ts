'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import type { Order } from '@/types';

interface UseOrderReturn {
  order: Order | null;
  loading: boolean;
  error: string | null;
  refetch: UseQueryResult<Order | null>['refetch'];
}

export default function useOrder(id: string | null | undefined): UseOrderReturn {
  const query = useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<Order | null> => {
      if (!id) return null;
      const res = await ordersService.getById(id);
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Order not found.');
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });

  return {
    order: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error.message || 'Order not found.') : null,
    refetch: query.refetch,
  };
}

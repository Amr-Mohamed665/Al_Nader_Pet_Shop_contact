'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import type { Product } from '@/types';

interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: UseQueryResult<Product | null>['refetch'];
}

export default function useProduct(id: string | null | undefined): UseProductReturn {
  const query = useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product | null> => {
      if (!id) return null;
      const res = await productsService.getById(id);
      return res.success && res.data ? res.data : null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  return {
    product: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error.message || 'Product not found.') : null,
    refetch: query.refetch,
  };
}

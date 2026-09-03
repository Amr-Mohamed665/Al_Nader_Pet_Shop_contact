'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { productsService } from '@/services/products.service';
import type { Product, ProductFilters } from '@/types';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: UseQueryResult<Product[]>['refetch'];
  updateFilters: (newFilters: Partial<ProductFilters>) => void;
  filters: ProductFilters;
}

export default function useProducts(
  initialFilters: ProductFilters = { search: '', category: '' }
): UseProductsReturn {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  const query = useQuery({
    queryKey: ['products', filters],
    queryFn: async (): Promise<Product[]> => {
      const res = await productsService.getAll(filters);
      return res.success && res.data ? res.data : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    placeholderData: (previousData) => previousData,
  });

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    products: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error.message || 'An error occurred') : null,
    refetch: query.refetch,
    updateFilters,
    filters,
  };
}

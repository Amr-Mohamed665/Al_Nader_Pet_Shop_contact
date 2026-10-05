'use client';

import { useState, useCallback } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { itemsService } from '@/services/items.service';
import type { Item, ItemFilters } from '@/types';

interface UseItemsReturn {
  items: Item[];
  loading: boolean;
  error: string | null;
  refetch: UseQueryResult<Item[]>['refetch'];
  updateFilters: (newFilters: Partial<ItemFilters>) => void;
  filters: ItemFilters;
}

export default function useItems(
  initialFilters: ItemFilters = { search: '', category: '' }
): UseItemsReturn {
  const [filters, setFilters] = useState<ItemFilters>(initialFilters);
  const [prevInitialFilters, setPrevInitialFilters] = useState(initialFilters);

  if (
    prevInitialFilters.search !== initialFilters.search ||
    prevInitialFilters.category !== initialFilters.category
  ) {
    setPrevInitialFilters(initialFilters);
    setFilters(initialFilters);
  }

  const query = useQuery({
    queryKey: ['items', filters],
    queryFn: async (): Promise<Item[]> => {
      const res = await itemsService.getAll(filters);
      return res.success && res.data ? res.data : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    placeholderData: (previousData) => previousData,
  });

  const updateFilters = useCallback((newFilters: Partial<ItemFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    items: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error.message || 'An error occurred') : null,
    refetch: query.refetch,
    updateFilters,
    filters,
  };
}

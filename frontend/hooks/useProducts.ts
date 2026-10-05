'use client';

import useItems from './useItems';
import type { ItemFilters } from '@/types';

export default function useProducts(initialFilters?: ItemFilters) {
  const result = useItems(initialFilters);
  return {
    ...result,
    products: result.items,
  };
}

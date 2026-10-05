'use client';

import useItem from './useItem';

export default function useProduct(id: string | null | undefined) {
  const result = useItem(id);
  return {
    ...result,
    product: result.item,
  };
}

'use client';

import ItemFilters from './ItemFilters';

interface ProductFiltersProps {
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  className?: string;
}

export default function ProductFilters(props: ProductFiltersProps) {
  return <ItemFilters {...props} />;
}

'use client';

import { useCategoriesQuery } from '@/hooks/useCategories';
import { cn } from '@/utils/cn';

interface ProductFiltersProps {
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  className?: string;
}

export default function ProductFilters({
  selectedCategory,
  onSelectCategory,
  className,
}: ProductFiltersProps) {
  const { data: categories = [], isLoading } = useCategoriesQuery();

  if (isLoading || categories.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2 py-4 overflow-x-auto no-scrollbar', className)}>
      <button
        onClick={() => onSelectCategory('')}
        className={cn(
          'border px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer select-none',
          selectedCategory === ''
            ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/10'
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        )}
      >
        All Products
      </button>

      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => onSelectCategory(category.slug)}
          className={cn(
            'border px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none',
            selectedCategory.toLowerCase() === category.slug.toLowerCase()
              ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/10'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          )}
        >
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}

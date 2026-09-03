'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ShopLayout from '@/components/templates/ShopLayout';
import ProductGrid from '@/components/organisms/ProductGrid';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import useProducts from '@/hooks/useProducts';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const {
    products,
    loading,
    error,
    refetch,
  } = useProducts({ search: query });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Search Results
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Showing results for &quot;<span className="font-bold text-teal-600">{query}</span>&quot;
        </p>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Spinner size="md" />
          <span className="text-xs text-slate-400 font-bold tracking-wide">Searching products...</span>
        </div>
      ) : error ? (
        <div className="py-12">
          <ErrorState onRetry={refetch} description={error} />
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <ShopLayout>
      <Suspense
        fallback={
          <div className="py-20 flex flex-col items-center gap-3">
            <Spinner size="md" />
            <span className="text-xs text-slate-400 font-bold tracking-wide">Loading search...</span>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </ShopLayout>
  );
}

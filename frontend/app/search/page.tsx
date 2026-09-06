'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ShopLayout from '@/components/templates/ShopLayout';
import ProductGrid from '@/components/organisms/ProductGrid';
import SearchBar from '@/components/molecules/SearchBar';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import useProducts from '@/hooks/useProducts';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [search, setSearch] = useState(query);

  const {
    products,
    loading,
    error,
    refetch,
  } = useProducts({ search: search || query });

  const handleSearch = (term: string) => {
    setSearch(term);
    if (term.trim()) {
      router.replace(`/search?q=${encodeURIComponent(term.trim())}`, { scroll: false });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Search Results
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Showing results for &quot;<span className="font-bold text-teal-600">{search || query}</span>&quot;
        </p>
      </div>

      {/* Search Bar - Above Products */}
      <div className="flex justify-end">
        <SearchBar onSearch={handleSearch} initialValue={search || query} placeholder="Refine your search..." className="w-full max-w-xs" />
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

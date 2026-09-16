'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ShopLayout from '@/components/templates/ShopLayout';
import ItemGrid from '@/components/organisms/ItemGrid';
import ItemFilters from '@/components/organisms/ItemFilters';
import SearchBar from '@/components/molecules/SearchBar';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import useItems from '@/hooks/useItems';

function ItemsContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get('search') || '';
  const urlCategory = searchParams?.get('category') || '';

  const [category, setCategory] = useState(urlCategory);
  const [search, setSearch] = useState(urlSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevParams, setPrevParams] = useState({ search: urlSearch, category: urlCategory });

  if (prevParams.search !== urlSearch || prevParams.category !== urlCategory) {
    setPrevParams({ search: urlSearch, category: urlCategory });
    setSearch(urlSearch);
    setCategory(urlCategory);
  }
  
  const {
    items,
    loading,
    error,
    refetch,
    updateFilters,
  } = useItems({ search, category });

  const handleSearch = (term: string) => {
    setSearch(term);
    updateFilters({ search: term });
    setCurrentPage(1);
  };

  const handleCategorySelect = (slug: string) => {
    setCategory(slug);
    updateFilters({ category: slug });
    setCurrentPage(1);
  };

  const ITEMS_PER_PAGE = 12;
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Our Items Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse healthy pet food, accessories, cages, and toys
          </p>
        </div>

        <SearchBar onSearch={handleSearch} initialValue={search} className="w-full md:max-w-xs" />
      </div>

      {/* Filter Toggle Buttons */}
      <ItemFilters
        selectedCategory={category}
        onSelectCategory={handleCategorySelect}
      />

      {/* Catalog List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Spinner size="md" />
          <span className="text-xs text-slate-400 font-bold tracking-wide">Loading catalog items...</span>
        </div>
      ) : error ? (
        <div className="py-12">
          <ErrorState onRetry={refetch} description={error} />
        </div>
      ) : (
        <>
          <ItemGrid items={paginatedItems} />
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-8">
              {/* Page indicator */}
              <div className="text-xs text-slate-400 font-medium">
                Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{totalItems}</span> items
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]" />
                  Prev
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => {
                      setCurrentPage(pageNumber);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all duration-200 ${
                      currentPage === pageNumber
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-500/10'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <i className="fa-solid fa-chevron-right text-[10px]" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ItemsPage() {
  return (
    <ShopLayout>
      <Suspense
        fallback={
          <div className="py-20 flex flex-col items-center gap-3">
            <Spinner size="md" />
            <span className="text-xs text-slate-400 font-bold tracking-wide">Loading catalog...</span>
          </div>
        }
      >
        <ItemsContent />
      </Suspense>
    </ShopLayout>
  );
}

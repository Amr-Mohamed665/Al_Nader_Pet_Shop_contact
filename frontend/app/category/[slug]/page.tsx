'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import ShopLayout from '@/components/templates/ShopLayout';
import ProductGrid from '@/components/organisms/ProductGrid';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import useProducts from '@/hooks/useProducts';
import { useCategoriesQuery } from '@/hooks/useCategories';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const [prevSlug, setPrevSlug] = useState(slug);

  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setCurrentPage(1);
  }

  const categoryInfo = categories.find(
    (c: any) => c.slug.toLowerCase() === String(slug).toLowerCase()
  );

  const {
    products,
    loading: productsLoading,
    error,
    refetch,
  } = useProducts({ category: slug });

  const loading = categoriesLoading || productsLoading;

  const ITEMS_PER_PAGE = 12;
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <ShopLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Category Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {(categoryInfo as any)?.name || slug} Supplies
            </h1>
            {(categoryInfo as any)?.description && (
              <p className="text-sm text-slate-500 leading-relaxed">
                {(categoryInfo as any).description}
              </p>
            )}
          </div>
          
          {/* Category image */}
          {(categoryInfo as any)?.image && (
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100 shadow-sm z-10">
              <img
                src={(categoryInfo as any).image}
                alt={(categoryInfo as any).name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Spinner size="md" />
            <span className="text-xs text-slate-400 font-bold tracking-wide">Loading category items...</span>
          </div>
        ) : error ? (
          <div className="py-12">
            <ErrorState onRetry={refetch} description={error} />
          </div>
        ) : (
          <>
            <ProductGrid products={paginatedProducts} />
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-8">
                {/* Page indicator */}
                <div className="text-xs text-slate-400 font-medium">
                  Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold text-slate-700">
                    {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-700">{totalItems}</span> products
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
    </ShopLayout>
  );
}

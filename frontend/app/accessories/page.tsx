'use client';

import { useState } from 'react';
import ShopLayout from '@/components/templates/ShopLayout';

import Spinner from '@/components/atoms/Spinner';
import ProductGrid from '@/components/organisms/ProductGrid';
import useProducts from '@/hooks/useProducts';
import { useCategoriesQuery } from '@/hooks/useCategories';

export default function AccessoriesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesQuery();
  const { products, loading: productsLoading, error, refetch } = useProducts();

  const loading = categoriesLoading || productsLoading;

  // 1. Get all accessories category slugs
  const accessoriesSlugs = categories
    .filter((c: any) => c.isAccessory)
    .map((c: any) => c.slug.toLowerCase());

  // 2. Filter products to only show Accessories
  const allAccessories = products.filter(
    (p: any) =>
      p.category &&
      accessoriesSlugs.includes(p.category.toLowerCase()) &&
      p.available !== false
  );

  // 3. Get the filter tabs (only categories created as accessories in dashboard)
  const tabs = categories.filter((c: any) => c.isAccessory);

  // 4. Filter accessories based on active tab
  let displayedAccessories = allAccessories;
  if (activeTab !== 'all') {
    const activeCategory = categories.find((c: any) => String(c.id || c._id) === String(activeTab));
    if (activeCategory) {
      displayedAccessories = allAccessories.filter(
        (p: any) => p.category && p.category.toLowerCase() === (activeCategory as any).slug.toLowerCase()
      );
    }
  }

  // Format the label for the tabs (e.g. "Dogs" -> "Dog Accessories")
  const getTabLabel = (tab: any) => {
    if (tab.name.toLowerCase().includes('accessories')) {
      return tab.name;
    }
    // Clean plural to make it read nicely (e.g. "Dogs" -> "Dog Accessories")
    const animalName = tab.name.endsWith('s') ? tab.name.slice(0, -1) : tab.name;
    return `${animalName} Accessories`;
  };

  const getEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('dog')) return '🐶';
    if (lower.includes('cat')) return '🐱';
    if (lower.includes('bird')) return '🐦';
    if (lower.includes('hamster')) return '🐹';
    if (lower.includes('reptil')) return '🦎';
    if (lower.includes('fish')) return '🐠';
    if (lower.includes('rabbit')) return '🐰';
    return '🐾';
  };

  return (
    <ShopLayout>
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">


        <div className="text-center py-4">
          <span className="inline-block text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">
            Premium Supplies
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pet Accessories Shop
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Find the perfect toys, beds, feeders, collars, and habitats for your companions.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Spinner size="md" />
            <span className="text-xs text-slate-400 font-bold tracking-wide">Loading Accessories...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dynamic Animal Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 pb-5">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Accessories ({allAccessories.length})
              </button>

              {tabs.map((tab: any) => {
                const count = allAccessories.filter((p: any) => {
                  return p.category && p.category.toLowerCase() === tab.slug.toLowerCase();
                }).length;

                return (
                  <button
                    key={tab.id || tab._id}
                    onClick={() => setActiveTab(String(tab.id || tab._id))}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 ${
                      activeTab === String(tab.id || tab._id)
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{getEmoji(tab.name)}</span>
                    <span className="capitalize">{tab.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === String(tab.id || tab._id)
                        ? 'bg-purple-700 text-white/90'
                        : 'bg-slate-200/80 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Product Listing */}
            {displayedAccessories.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-sm font-bold text-slate-500">No accessories found.</p>
                <p className="text-xs text-slate-400 mt-1">We are adding new accessories to this category soon.</p>
              </div>
            ) : (
              <ProductGrid products={displayedAccessories} />
            )}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}

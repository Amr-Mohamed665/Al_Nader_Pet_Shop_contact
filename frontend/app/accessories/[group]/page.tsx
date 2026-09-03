'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import ShopLayout from '@/components/templates/ShopLayout';
import Breadcrumbs from '@/components/atoms/Breadcrumbs';
import ProductGrid from '@/components/organisms/ProductGrid';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import useProducts from '@/hooks/useProducts';
import { useAccessoriesTree } from '@/hooks/useCategories';

export default function GroupAccessoriesPage() {
  const { group } = useParams<{ group: string }>();
  const { tree: accessoriesTree, isLoading: treeLoading } = useAccessoriesTree();
  const { products, loading: productsLoading, error, refetch } = useProducts();

  const groupItem = (accessoriesTree as any[]).find(
    (g: any) => g.slug.toLowerCase() === String(group).toLowerCase()
  );

  const loading = treeLoading || productsLoading;

  if (loading) {
    return (
      <ShopLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </ShopLayout>
    );
  }

  if (!groupItem) {
    return (
      <ShopLayout>
        <div className="py-12">
          <ErrorState
            title="Category not found"
            description={`The accessories category "${group}" does not exist.`}
            onRetry={refetch}
          />
        </div>
      </ShopLayout>
    );
  }

  // Get all descendant subcategory slugs
  const groupSlugs = [groupItem.slug.toLowerCase(), ...groupItem.subcategories.map((s: any) => s.slug.toLowerCase())];
  const groupProducts = products.filter(
    (p: any) => p.category && groupSlugs.includes(p.category.toLowerCase()) && p.available !== false
  );

  return (
    <ShopLayout>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Accessories', href: '/accessories' },
            { label: groupItem.name },
          ]}
        />

        {/* Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-block text-[10px] font-bold text-purple-600 uppercase tracking-widest">
              Accessories
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {groupItem.name.toLowerCase().includes('accessories') || groupItem.name.toLowerCase().includes('accessory') ? groupItem.name : `${groupItem.name} Accessories`}
            </h1>
            {groupItem.description && (
              <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                {groupItem.description}
              </p>
            )}
          </div>
          {groupItem.image ? (
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-slate-100">
              <img src={groupItem.image} alt={groupItem.name} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="text-3xl bg-purple-50 h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner self-start md:self-auto flex-shrink-0 select-none">
              {groupItem.name.toLowerCase().includes('dog') ? '🐶' : groupItem.name.toLowerCase().includes('cat') ? '🐱' : '🐦'}
            </div>
          )}
        </div>

        {/* Subcategories Filter Chips */}
        {groupItem.subcategories.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Filter by Subcategory
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {groupItem.subcategories.map((sub: any) => (
                <Link
                  key={sub.id}
                  href={`/accessories/${groupItem.slug}/${sub.slug}`}
                  className="px-4 py-2 bg-white border border-slate-200/80 hover:border-purple-300 rounded-xl text-xs font-bold text-slate-600 hover:text-purple-600 shadow-sm transition-all hover:translate-y-[-1px] select-none capitalize"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <hr className="border-slate-200/80 !my-6" />

        {/* Product List Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            All {groupItem.name.toLowerCase().includes('accessories') || groupItem.name.toLowerCase().includes('accessory') ? groupItem.name : `${groupItem.name} Accessories`}
          </h2>
          <span className="text-xs text-slate-400 font-bold">
            {groupProducts.length} Product(s) Found
          </span>
        </div>

        {/* Product Grid */}
        {groupProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80">
            <i className="fa-solid fa-box-open text-4xl text-slate-200 mb-3" />
            <p className="text-sm font-bold text-slate-500">No products found in this category.</p>
            <p className="text-xs text-slate-400 mt-1">Please check back later.</p>
          </div>
        ) : (
          <ProductGrid products={groupProducts} />
        )}
      </div>
    </ShopLayout>
  );
}

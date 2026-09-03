'use client';

import { useParams } from 'next/navigation';
import ShopLayout from '@/components/templates/ShopLayout';
import Breadcrumbs from '@/components/atoms/Breadcrumbs';
import ProductGrid from '@/components/organisms/ProductGrid';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import useProducts from '@/hooks/useProducts';
import { useAccessoriesTree } from '@/hooks/useCategories';

export default function SubcategoryAccessoriesPage() {
  const { group, subcategory } = useParams<{ group: string; subcategory: string }>();
  const { tree: accessoriesTree, isLoading: treeLoading } = useAccessoriesTree();
  const { products, loading: productsLoading, error, refetch } = useProducts();

  const groupItem = (accessoriesTree as any[]).find(
    (g: any) => g.slug.toLowerCase() === String(group).toLowerCase()
  );

  const subItem = groupItem?.subcategories.find(
    (s: any) => s.slug.toLowerCase() === String(subcategory).toLowerCase()
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

  if (!groupItem || !subItem) {
    return (
      <ShopLayout>
        <div className="py-12">
          <ErrorState
            title="Subcategory not found"
            description={`The subcategory "${subcategory}" under "${group}" does not exist.`}
            onRetry={refetch}
          />
        </div>
      </ShopLayout>
    );
  }

  // Filter products by specific subcategory slug
  const filteredProducts = products.filter(
    (p: any) => p.category && p.category.toLowerCase() === subItem.slug.toLowerCase() && p.available !== false
  );

  return (
    <ShopLayout>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Accessories', href: '/accessories' },
            { label: groupItem.name, href: `/accessories/${groupItem.slug}` },
            { label: subItem.name },
          ]}
        />

        {/* Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] font-bold text-purple-600 uppercase tracking-widest">
              {groupItem.name.toLowerCase().includes('accessories') || groupItem.name.toLowerCase().includes('accessory') ? groupItem.name : `${groupItem.name} Accessories`}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight capitalize">
              {groupItem.name} {subItem.name}
            </h1>
            {(subItem?.description || groupItem.description) && (
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {subItem?.description || groupItem.description}
              </p>
            )}
          </div>
          {(subItem?.image || groupItem.image) ? (
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-slate-100">
              <img src={subItem?.image || groupItem.image} alt={subItem?.name || groupItem.name} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="text-2xl bg-purple-50 h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner self-start sm:self-auto flex-shrink-0 select-none">
              {groupItem.name.toLowerCase().includes('dog') ? '🐶' : groupItem.name.toLowerCase().includes('cat') ? '🐱' : '🐦'}
            </div>
          )}
        </div>

        <hr className="border-slate-200/80 !my-6" />

        {/* Product List Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Available Products
          </h2>
          <span className="text-xs text-slate-400 font-bold">
            {filteredProducts.length} Product(s) Found
          </span>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80">
            <i className="fa-solid fa-box-open text-4xl text-slate-200 mb-3" />
            <p className="text-sm font-bold text-slate-500">No products found in this category.</p>
            <p className="text-xs text-slate-400 mt-1">Please check back later.</p>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </ShopLayout>
  );
}

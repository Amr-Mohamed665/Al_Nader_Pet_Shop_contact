import Link from 'next/link';
import ProductGrid from '@/components/organisms/ProductGrid';
import Button from '@/components/atoms/Button';
import type { Product } from '@/types';

interface FeaturedProductsProps {
  products?: Product[];
}

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  return (
    <section className="mb-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="inline-block text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">
            Top Picks
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Featured Products
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Handpicked quality items and supplies popular among pet owners
          </p>
        </div>
        <Link href="/products" className="flex-shrink-0">
          <Button variant="ghost" size="sm" className="font-extrabold text-purple-600 hover:text-purple-700 hover:bg-purple-50">
            View All Products →
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-sm font-semibold">
          No featured products selected yet.
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}

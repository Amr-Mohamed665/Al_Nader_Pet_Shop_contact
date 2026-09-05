'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import ShopLayout from '@/components/templates/ShopLayout';
import Price from '@/components/atoms/Price';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Spinner from '@/components/atoms/Spinner';
import MediaRenderer from '@/components/atoms/MediaRenderer';
import ErrorState from '@/components/molecules/ErrorState';
import QuantitySelector from '@/components/molecules/QuantitySelector';
import useProduct from '@/hooks/useProduct';
import { useCart } from '@/context/CartContext';
import { productsService } from '@/services/products.service';
import WishlistButton from '@/components/atoms/WishlistButton';
import ProductCard from '@/components/organisms/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { product, loading: productLoading, error, refetch } = useProduct(id);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);



  // Fetch recommendations
  const recommendationsQuery = useQuery({
    queryKey: ['product-recommendations', id],
    queryFn: () => productsService.getRecommendedAccessories(id!),
    enabled: !!id,
  });

  const recommendations = recommendationsQuery.data?.success ? recommendationsQuery.data.data : [];
  const [recIndex, setRecIndex] = useState(0);
  const itemsPerPage = 4;

  const visibleRecommendations = (recommendations as any[]).slice(recIndex, recIndex + itemsPerPage);

  const handlePrevRec = () => {
    setRecIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextRec = () => {
    setRecIndex((prev) => Math.min(Math.max(0, (recommendations as any[]).length - itemsPerPage), prev + 1));
  };

  const loading = productLoading;

  if (loading) {
    return (
      <ShopLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </ShopLayout>
    );
  }

  if (error || !product) {
    return (
      <ShopLayout>
        <div className="py-12">
          <ErrorState
            title="Product not found"
            description="The requested product does not exist or is currently unavailable."
            onRetry={refetch}
          />
        </div>
      </ShopLayout>
    );
  }

  const { name, price, image, description, category, available } = product;

  const handleAddToCart = () => {
    if (available) {
      addItem(product, quantity);
    }
  };

  return (
    <ShopLayout>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-slate-500 hover:text-teal-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          ← Back
        </button>

        {/* Product Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          {/* Media Player Column */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
            <MediaRenderer
              src={image}
              alt={name}
              sizes="(max-width: 768px) 100vw, 50vw"
              controls
              autoPlay
              priority
              fallback={
                <div className="h-full w-full flex items-center justify-center text-slate-400 font-extrabold text-5xl select-none">
                  🐾
                </div>
              }
            />
          </div>

          {/* Info Details Column */}
          <div className="flex flex-col justify-between py-2 gap-6">
            <div className="space-y-4">
              {/* Category tag */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block bg-teal-50 text-teal-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-teal-100 uppercase tracking-wider">
                  {productCategory ? productCategory.name : category}
                </span>
                <Badge variant="success" className={available ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-emerald-500 text-white border-emerald-500 shadow-sm"}>
                  {available ? 'Available' : 'SOLD'}
                </Badge>
              </div>

              {/* Title & Price */}
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  {name}
                </h1>
                <div className="flex items-baseline gap-2 pt-1">
                  <Price amount={price} className="text-2xl text-teal-600 font-extrabold" />
                  <span className="text-xs text-slate-400 font-semibold">incl. VAT</span>
                </div>
              </div>

              {/* Description */}
              {description && (
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    About this product
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed text-balance">
                    {description}
                  </p>
                </div>
              )}
            </div>

            {available ? (
              <div className="space-y-4 pt-4 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500">Select Quantity</span>
                  <QuantitySelector
                    quantity={quantity}
                    onIncrease={() => setQuantity((q) => q + 1)}
                    onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="primary"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 font-extrabold shadow-md shadow-teal-500/10 text-xs uppercase tracking-wider"
                  >
                    Add {quantity} to Cart 🛒
                  </Button>

                  <WishlistButton
                    productId={product.id}
                    productName={product.name}
                    className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 hover:border-purple-300 rounded-xl transition-all shadow-sm flex-shrink-0"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-slate-100 mt-auto">
                <p className="text-xs font-bold text-slate-500">This pet or accessory has been sold. You can inquire about similar options via WhatsApp:</p>
                <div className="flex gap-3 pt-2">
                  <a
                    href={`https://wa.me/971506767915?text=${encodeURIComponent(`Hi Al Nader Pets! 🐾 I am inquiring about the product "${name}" which is currently marked as SOLD.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <i className="fa-brands fa-whatsapp text-lg" />
                    Inquire on WhatsApp 🐾
                  </a>

                  <WishlistButton
                    productId={product.id}
                    productName={product.name}
                    className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 hover:border-purple-300 rounded-xl transition-all shadow-sm flex-shrink-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider — always shown between product detail and recommendations */}
        <hr className="border-t-2 border-slate-300" />

        {/* Dynamic Recommendations / Frequently bought together */}
        {(recommendations as any[]).length > 0 && (
          <div className="space-y-5">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Frequently bought together
            </h2>

            {/* Carousel Row with Previous and Next Buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Previous Button — matches Add to Cart: teal-500, rounded-lg, font-semibold */}
              <button
                type="button"
                onClick={handlePrevRec}
                disabled={recIndex === 0}
                aria-label="Previous recommendations"
                className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-700 hover:bg-teal-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 font-semibold"
              >
                <i className="fa-solid fa-chevron-left text-sm" />
              </button>

              {/* Products Grid — 1 col on xs, 2 col on sm+, 4 col on md+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 flex-1 min-w-0">
                {visibleRecommendations.map((item: any) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>

              {/* Next Button — matches Add to Cart: teal-500, rounded-lg, font-semibold */}
              <button
                type="button"
                onClick={handleNextRec}
                disabled={recIndex + itemsPerPage >= (recommendations as any[]).length}
                aria-label="Next recommendations"
                className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-700 hover:bg-teal-800 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700 font-semibold"
              >
                <i className="fa-solid fa-chevron-right text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}

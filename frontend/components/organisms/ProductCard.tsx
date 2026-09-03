'use client';

import Link from 'next/link';
import Price from '@/components/atoms/Price';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import MediaRenderer from '@/components/atoms/MediaRenderer';
import { useCart } from '@/context/CartContext';
import WishlistButton from '@/components/atoms/WishlistButton';
import type { Product } from '@/types';
import type { MouseEvent } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { id, name, price, image, description, available } = product;

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (available) {
      addItem(product);
    }
  };

  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:border-teal-500/20 transition-all duration-300 relative"
    >
      {/* Product Image / Video container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <MediaRenderer
          src={image}
          alt={name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="group-hover:scale-105 transition-transform duration-500"
          autoPlay
        />

        {/* Wishlist Button Overlay */}
        <WishlistButton
          productId={id}
          productName={name}
          className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white border border-slate-200/50 backdrop-blur-sm rounded-full h-8.5 w-8.5 shadow-sm"
        />

        {/* Availability Badge */}
        {!available && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
            <Badge variant="success" className="scale-110 font-bold px-3 py-1 bg-emerald-500 text-white border-emerald-500 shadow-md">
              SOLD
            </Badge>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-teal-600 transition-colors mb-1">
          {name}
        </h3>
        
        {description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3 flex-grow">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-slate-50">
          <Price amount={price} className="text-base text-teal-600 font-extrabold" />
          
          <Button
            variant={available ? 'primary' : 'outline'}
            size="sm"
            disabled={!available}
            onClick={handleAddToCart}
            className="px-3 py-1.5 text-xs font-bold"
          >
            {available ? 'Add to Cart' : 'Sold Out'}
          </Button>
        </div>
      </div>
    </Link>
  );
}

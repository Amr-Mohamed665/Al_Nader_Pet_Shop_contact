'use client';

import ItemCard from './ItemCard';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return <ItemCard item={product} />;
}

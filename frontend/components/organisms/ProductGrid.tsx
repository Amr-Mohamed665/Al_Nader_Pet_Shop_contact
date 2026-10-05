import ItemGrid from './ItemGrid';
import type { Product } from '@/types';

interface ProductGridProps {
  products?: Product[];
  className?: string;
}

export default function ProductGrid({ products = [], className }: ProductGridProps) {
  return <ItemGrid items={products} className={className} />;
}

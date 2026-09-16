import FeaturedItems from './FeaturedItems';
import type { Product } from '@/types';

interface FeaturedProductsProps {
  products?: Product[];
}

export default function FeaturedProducts({ products = [] }: FeaturedProductsProps) {
  return <FeaturedItems items={products} />;
}

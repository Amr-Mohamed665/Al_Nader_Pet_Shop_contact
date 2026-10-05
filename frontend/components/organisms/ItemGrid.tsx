import ItemCard from '@/components/organisms/ItemCard';
import EmptyState from '@/components/molecules/EmptyState';
import { cn } from '@/utils/cn';
import type { Item } from '@/types';

interface ItemGridProps {
  items?: Item[];
  className?: string;
}

export default function ItemGrid({ items = [], className }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 w-full">
        <EmptyState
          title="No items available"
          description="We couldn't find any items in this category at the moment. Please check back later!"
          icon="📦"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full',
        className
      )}
    >
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

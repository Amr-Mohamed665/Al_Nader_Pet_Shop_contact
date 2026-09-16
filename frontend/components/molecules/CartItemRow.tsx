import QuantitySelector from '@/components/molecules/QuantitySelector';
import Price from '@/components/atoms/Price';
import IconButton from '@/components/atoms/IconButton';
import { MediaThumbnail } from '@/components/atoms/MediaRenderer';
import type { CartItem } from '@/types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-slate-100 last:border-0 items-center animate-fade-in bg-white">
      {/* Product Image / Video thumbnail */}
      <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
        <MediaThumbnail src={item.image} alt={item.name} />
      </div>

      {/* Product Info */}
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-bold text-slate-800 truncate mb-0.5">
          {item.name}
        </h4>
        <div className="flex items-center justify-between gap-2 mt-1">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="scale-90 origin-left"
          />
          <IconButton
            variant="danger"
            onClick={() => onRemove(item.id)}
            className="p-1.5 rounded-full hover:bg-rose-50"
            title="Remove item"
          >
            🗑️
          </IconButton>
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex flex-col items-end flex-shrink-0">
        <Price amount={item.price * item.quantity} className="text-sm text-teal-600 font-bold" />
        <span className="text-[10px] text-slate-400 mt-0.5">
          {formatUnit(item.price)} each
        </span>
      </div>
    </div>
  );
}

function formatUnit(price: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

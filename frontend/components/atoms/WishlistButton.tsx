'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCheckWishlist, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { showToast } from '@/utils/toast';
import { playSound, getSoundForCategory } from '@/lib/sounds';
import type { MouseEvent } from 'react';

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  category?: string;
  className?: string;
}

export default function WishlistButton({ productId, productName, category, className = '' }: WishlistButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: inWishlist, isLoading } = useCheckWishlist(productId);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const handleToggle = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (inWishlist) {
      await removeFromWishlist.mutateAsync(productId);
      showToast('info', productName ? `${productName} removed from wishlist` : 'Removed from wishlist');
      playSound('wishlist-remove');
    } else {
      await addToWishlist.mutateAsync(productId);
      showToast('success', productName ? `${productName} added to wishlist ❤️` : 'Added to wishlist ❤️');
      playSound(getSoundForCategory(category || productName));
    }
  };

  const isMutating = addToWishlist.isPending || removeFromWishlist.isPending;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isMutating}
      className={`transition-all active:scale-95 duration-200 select-none cursor-pointer flex items-center justify-center ${className} ${
        inWishlist ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
      }`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading || isMutating ? (
        <i className="fa-solid fa-spinner animate-spin text-sm" />
      ) : inWishlist ? (
        <i className="fa-solid fa-heart text-lg" />
      ) : (
        <i className="fa-regular fa-heart text-lg" />
      )}
    </button>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlist.service';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';

export function useWishlistQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery<Product[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await wishlistService.getAll();
      return res.success && res.data ? res.data : [];
    },
    enabled: isAuthenticated,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      return await wishlistService.add(productId);
    },
    onSuccess: (_, productId) => {
      void queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      void queryClient.invalidateQueries({ queryKey: ['wishlist', 'check', productId] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      return await wishlistService.remove(productId);
    },
    onSuccess: (_, productId) => {
      void queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      void queryClient.invalidateQueries({ queryKey: ['wishlist', 'check', productId] });
    },
  });
}

export function useCheckWishlist(productId: string | null | undefined) {
  const { isAuthenticated } = useAuth();
  return useQuery<boolean>({
    queryKey: ['wishlist', 'check', productId],
    queryFn: async () => {
      if (!productId) return false;
      const res = await wishlistService.check(productId);
      return res.success ? (res.inWishlist ?? false) : false;
    },
    enabled: isAuthenticated && !!productId,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService } from '@/services/wishlist.service';
import { useAuth } from '@/context/AuthContext';
import type { Item } from '@/types';

export function useWishlistQuery() {
  const { isAuthenticated } = useAuth();
  return useQuery<Item[]>({
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
    mutationFn: async (itemId: string) => {
      return await wishlistService.add(itemId);
    },
    onSuccess: (_, itemId) => {
      void queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      void queryClient.invalidateQueries({ queryKey: ['wishlist', 'check', itemId] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      return await wishlistService.remove(itemId);
    },
    onSuccess: (_, itemId) => {
      void queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      void queryClient.invalidateQueries({ queryKey: ['wishlist', 'check', itemId] });
    },
  });
}

export function useCheckWishlist(itemId: string | null | undefined) {
  const { isAuthenticated } = useAuth();
  return useQuery<boolean>({
    queryKey: ['wishlist', 'check', itemId],
    queryFn: async () => {
      if (!itemId) return false;
      const res = await wishlistService.check(itemId);
      return res.success ? (res.inWishlist ?? false) : false;
    },
    enabled: isAuthenticated && !!itemId,
  });
}

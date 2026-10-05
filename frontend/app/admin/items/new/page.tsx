'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import ItemForm from '@/components/organisms/ItemForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsService } from '@/services/items.service';
import type { Item } from '@/types';

export default function NewItemPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => itemsService.create(data),
    onSuccess: async (response) => {
      if (response.success) {
        if (response.data) {
          // Immediately populate React Query cache with the new item
          queryClient.setQueryData<Item[]>(['admin-items'], (old) => {
            if (!old) return [response.data];
            const exists = old.some((it) => it.id === response.data.id);
            return exists ? old : [...old, response.data];
          });
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['admin-items'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['items'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['featured-homepage-items'], refetchType: 'all' }),
        ]);

        router.push('/admin/items');
        router.refresh();
      } else {
        setError(response.message || 'Failed to create item.');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'An error occurred.');
    },
  });

  const handleSubmit = (data: any) => {
    setError('');
    createMutation.mutate(data);
  };

  const loading = createMutation.isPending;

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Add New Item
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in the item information below.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-xs text-rose-600 p-4 rounded-xl font-bold max-w-xl">
              ⚠️ {error}
            </div>
          )}

          <ItemForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

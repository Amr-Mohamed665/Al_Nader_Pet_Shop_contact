'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import ItemForm from '@/components/organisms/ItemForm';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import useItem from '@/hooks/useItem';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsService } from '@/services/items.service';
import type { Item } from '@/types';

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { item, loading: fetchLoading, error: fetchError, refetch } = useItem(id);
  const [submitError, setSubmitError] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: any) => itemsService.update(id!, data),
    onSuccess: async (response) => {
      if (response.success) {
        if (response.data) {
          const updatedItem = response.data;
          // Immediately update React Query cache with edited item
          queryClient.setQueryData<Item[]>(['admin-items'], (old) =>
            old ? old.map((it) => (it.id === id ? { ...it, ...updatedItem } : it)) : [updatedItem]
          );
          queryClient.setQueryData(['item', id], updatedItem);
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['admin-items'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['items'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['item', id], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['featured-homepage-items'], refetchType: 'all' }),
        ]);

        router.push('/admin/items');
        router.refresh();
      } else {
        setSubmitError(response.message || 'Failed to update item.');
      }
    },
    onError: (err: any) => {
      setSubmitError(err.response?.data?.message || err.message || 'An error occurred.');
    },
  });

  const handleSubmit = (data: any) => {
    setSubmitError('');
    updateMutation.mutate(data);
  };

  const submitLoading = updateMutation.isPending;

  if (fetchLoading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="min-h-[50vh] flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (fetchError || !item) {
    return (
      <AdminRoute>
        <AdminLayout>
          <ErrorState title="Item not found" description={fetchError ?? undefined} onRetry={refetch} />
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Edit Item
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Editing: <strong className="text-slate-700">{item.name}</strong>
            </p>
          </div>

          {submitError && (
            <div className="bg-rose-50 border border-rose-100 text-xs text-rose-600 p-4 rounded-xl font-bold max-w-xl">
              ⚠️ {submitError}
            </div>
          )}

          <ItemForm
            initialValues={{
              name: item.name || '',
              category:
                typeof item.category === 'object' && item.category !== null
                  ? (item.category as any).slug || (item.category as any)._id || (item.category as any).id || ''
                  : item.category || item.categorySlug || '',
              price: item.price || '',
              description: item.description || '',
              image: item.image || '',
              available: item.available !== false,
            }}
            onSubmit={handleSubmit}
            isLoading={submitLoading}
          />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

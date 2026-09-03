'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import ProductForm from '@/components/organisms/ProductForm';
import { productsService } from '@/services/products.service';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await productsService.create(data);
      if (response.success) {
        router.push('/admin/products');
      } else {
        setError(response.message || 'Failed to create product.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Add New Product
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in the product information below.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-xs text-rose-600 p-4 rounded-xl font-bold max-w-xl">
              ⚠️ {error}
            </div>
          )}

          <ProductForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

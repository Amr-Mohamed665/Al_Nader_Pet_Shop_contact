'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Price from '@/components/atoms/Price';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import ConfirmModal from '@/components/molecules/ConfirmModal';
import { productsService } from '@/services/products.service';
import { useCategoriesQuery } from '@/hooks/useCategories';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MAX_FEATURED = 8;

// ─── Toast notification ────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all animate-fade-in ${
        type === 'success'
          ? 'bg-teal-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      <i className={`fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
      {message}
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 transition-opacity">
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );
}

// ─── Availability Toggle Switch ────────────────────────────────────────────────
function AvailabilityToggle({ available, onChange, toggling }: { available: boolean; onChange: () => void; toggling: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={toggling}
      title={available ? 'Click to hide from website' : 'Click to show on website'}
      className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none ${
        toggling ? 'opacity-50 cursor-wait' : 'cursor-pointer'
      } ${available ? 'bg-teal-500' : 'bg-slate-300'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          available ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Product Row (Desktop) ─────────────────────────────────────────────────────
function ProductRow({ product, onDelete, featured, onToggleFeatured, featuredCount, onToggleAvailability, togglingId, isSearchActive, categoryName }: any) {
  const isFeatured = featured.includes(product.id);
  const isAvailable = product.available !== false;
  const atLimit = featuredCount >= MAX_FEATURED && !isFeatured;
  const isDisabled = atLimit || !isAvailable;
  const toggling = togglingId === product.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.id,
    disabled: isSearchActive,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: (isDragging ? 'relative' : undefined) as any,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 transition-colors hover:bg-slate-50/60 ${
        isDragging ? 'bg-teal-50/40 border-teal-200 shadow-md opacity-85' : ''
      } ${!isAvailable ? 'opacity-60' : ''}`}
    >
      {/* Drag handle */}
      <td
        className={`pl-4 py-3 w-10 text-center text-slate-300 transition-colors ${
          isSearchActive
            ? 'cursor-not-allowed opacity-30'
            : 'cursor-grab active:cursor-grabbing hover:text-teal-500'
        }`}
        title={isSearchActive ? 'Clear search to reorder' : 'Drag to reorder'}
        {...(!isSearchActive ? { ...attributes, ...listeners } : {})}
      >
        <i className="fa-solid fa-grip-vertical" />
      </td>

      {/* Featured Star Toggle */}
      <td className="pl-4 py-3 w-12 text-center">
        <button
          onClick={() => !isDisabled && onToggleFeatured(product.id)}
          disabled={isDisabled}
          title={
            !isAvailable
              ? 'Cannot feature hidden products'
              : atLimit
              ? `Max ${MAX_FEATURED} featured products`
              : isFeatured
              ? 'Remove from featured'
              : 'Add to featured'
          }
          className={`text-lg transition-all focus:outline-none ${
            isDisabled ? 'opacity-40 cursor-not-allowed text-slate-300' : 'cursor-pointer active:scale-125'
          } ${isFeatured ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
          aria-label={isFeatured ? 'Remove from featured' : 'Add to featured'}
        >
          {isFeatured ? (
            <i className="fa-solid fa-star" />
          ) : (
            <i className="fa-regular fa-star" />
          )}
        </button>
      </td>

      {/* Image */}
      <td className="px-3 py-3 pl-2">
        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" unoptimized />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm select-none">🐾</div>
          )}
        </div>
      </td>

      {/* Name */}
      <td className="px-3 py-3 font-bold text-slate-900 max-w-[160px] sm:max-w-[220px] truncate text-xs">
        {product.name}
        {isFeatured && (
          <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-1.5 py-0.5">
            <i className="fa-solid fa-star text-[8px]" /> Featured
          </span>
        )}
      </td>

      {/* Category */}
      <td className="px-3 py-3 hidden sm:table-cell">
        <Badge variant="primary" className="capitalize">{categoryName}</Badge>
      </td>

      {/* Price */}
      <td className="px-3 py-3">
        <Price amount={product.price} className="text-teal-600 font-extrabold text-sm" />
      </td>

      {/* Availability Toggle */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <AvailabilityToggle
            available={isAvailable}
            onChange={() => onToggleAvailability(product)}
            toggling={toggling}
          />
          <span className={`text-[10px] font-bold ${isAvailable ? 'text-teal-600' : 'text-slate-400'}`}>
            {isAvailable ? 'Live' : 'Hidden'}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-3 py-3 text-right pr-4">
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="outline" size="sm" className="py-1 px-2.5 text-[10px] font-bold h-auto">Edit</Button>
          </Link>
          <Button variant="danger" size="sm" className="py-1 px-2.5 text-[10px] font-bold h-auto" onClick={() => onDelete(product)}>
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── Product Card (Mobile) ─────────────────────────────────────────────────────
function ProductCard({ product, onDelete, featured, onToggleFeatured, featuredCount, onToggleAvailability, togglingId, isFirst, isLast, onMoveUp, onMoveDown, isSearchActive, categoryName }: any) {
  const isFeatured = featured.includes(product.id);
  const isAvailable = product.available !== false;
  const atLimit = featuredCount >= MAX_FEATURED && !isFeatured;
  const isDisabled = atLimit || !isAvailable;
  const toggling = togglingId === product.id;

  return (
    <div
      className={`bg-white border rounded-2xl shadow-sm transition-all flex ${
        'border-slate-200/80'
      } ${!isAvailable ? 'opacity-70' : ''} ${isFeatured ? 'border-teal-300 ring-1 ring-teal-200' : ''}`}
    >
      {/* Card content */}
      <div className="flex-grow p-4 space-y-3 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-grow">
            <button
              onClick={() => !isDisabled && onToggleFeatured(product.id)}
              disabled={isDisabled}
              title={
                !isAvailable
                  ? 'Cannot feature hidden products'
                  : atLimit
                  ? `Max ${MAX_FEATURED} featured products`
                  : isFeatured
                  ? 'Remove from featured'
                  : 'Add to featured'
              }
              className={`text-lg transition-all focus:outline-none flex-shrink-0 ${
                isDisabled ? 'opacity-40 cursor-not-allowed text-slate-300' : 'cursor-pointer active:scale-125'
              } ${isFeatured ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
              aria-label={isFeatured ? 'Remove from featured' : 'Add to featured'}
            >
              {isFeatured ? (
                <i className="fa-solid fa-star" />
              ) : (
                <i className="fa-regular fa-star" />
              )}
            </button>

            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
              {product.image ? (
                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" unoptimized />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-base select-none">🐾</div>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{product.name}</h3>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <Badge variant="primary" className="text-[9px] px-1.5 py-0.5 capitalize">{categoryName}</Badge>
                {isFeatured && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-1.5 py-0.5">
                    <i className="fa-solid fa-star text-[8px]" /> Featured
                  </span>
                )}
              </div>
              <div className="mt-1">
                <Price amount={product.price} className="text-teal-600 font-extrabold text-xs" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Visible</span>
            <AvailabilityToggle
              available={isAvailable}
              onChange={() => onToggleAvailability(product)}
              toggling={toggling}
            />
          </div>
        </div>

        <div className="flex justify-end items-center pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Link href={`/admin/products/${product.id}/edit`}>
              <Button variant="outline" size="sm" className="py-1 px-3 text-[10px] font-bold h-auto">Edit</Button>
            </Link>
            <Button variant="danger" size="sm" className="py-1 px-3 text-[10px] font-bold h-auto" onClick={() => onDelete(product)}>
              Delete
            </Button>
          </div>
        </div>
      </div>

      {!isSearchActive && (
        <div className="flex flex-col items-center justify-center gap-1 px-2 border-l border-slate-100 flex-shrink-0">
          <button
            onClick={() => onMoveUp(product.id)}
            disabled={isFirst}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-teal-500 hover:border-teal-300 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all active:scale-90"
            title="Move up"
          >
            <i className="fa-solid fa-chevron-up text-[10px]" />
          </button>
          <button
            onClick={() => onMoveDown(product.id)}
            disabled={isLast}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-teal-500 hover:border-teal-300 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all active:scale-90"
            title="Move down"
          >
            <i className="fa-solid fa-chevron-down text-[10px]" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const { data: categories = [] } = useCategoriesQuery();

  const getCategoryName = useCallback((slug: string) => {
    const cat = (categories as any[]).find((c: any) => c.slug === slug);
    return cat ? cat.name : slug;
  }, [categories]);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingAvailId, setTogglingAvailId] = useState<string | null>(null);

  // Featured state
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [pendingFeatured, setPendingFeatured] = useState<string[]>([]);

  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = useCallback((message: string, type = 'success') => {
    setToast({ message, type });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, featuredRes] = await Promise.all([
        productsService.getAll({ all: true }),
        productsService.getFeaturedIds(),
      ]);
      if (productsRes.success) setProducts(productsRes.data);
      else setError(productsRes.message || 'Failed to load products.');

      if (featuredRes.success) {
        setFeaturedIds(featuredRes.data);
        setPendingFeatured(featuredRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (searchQuery) return; // Prevent reordering during active search

    let newProducts: any[] = [];
    setProducts((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id);
      const newIndex = prev.findIndex((p) => p.id === over.id);
      newProducts = arrayMove(prev, oldIndex, newIndex);
      return newProducts;
    });

    try {
      const res = await productsService.reorder(newProducts.map((p) => p.id));
      if (res.success) {
        showToast('Products reordered successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to save product order.', 'error');
        fetchProducts(); // Revert
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save product order.', 'error');
      fetchProducts(); // Revert
    }
  }, [searchQuery, fetchProducts, showToast]);

  const handleMoveProduct = useCallback(async (productId: string, direction: 'up' | 'down') => {
    const index = products.findIndex((p) => p.id === productId);
    if (index < 0) return;
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= products.length) return;

    const newProducts = arrayMove(products, index, swapIndex);
    setProducts(newProducts);

    try {
      const res = await productsService.reorder(newProducts.map((p) => p.id));
      if (res.success) {
        showToast('Product moved successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to save product order.', 'error');
        fetchProducts();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save product order.', 'error');
      fetchProducts();
    }
  }, [products, fetchProducts, showToast]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsRes, featuredRes] = await Promise.all([
          productsService.getAll({ all: true }),
          productsService.getFeaturedIds(),
        ]);
        if (cancelled) return;
        if (productsRes.success) setProducts(productsRes.data);
        else setError(productsRes.message || 'Failed to load products.');

        if (featuredRes.success) {
          setFeaturedIds(featuredRes.data);
          setPendingFeatured(featuredRes.data);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'An error occurred.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const handleToggleFeatured = useCallback(async (id: string) => {
    const newPending = pendingFeatured.includes(id)
      ? pendingFeatured.filter((x) => x !== id)
      : pendingFeatured.length >= MAX_FEATURED
        ? null
        : [...pendingFeatured, id];

    if (!newPending) return;

    setPendingFeatured(newPending);

    try {
      const res = await productsService.setFeaturedIds(newPending);
      if (res.success) {
        setFeaturedIds(res.data);
        setPendingFeatured(res.data);
      } else {
        showToast(res.message || 'Failed to update featured products.', 'error');
        setPendingFeatured(featuredIds);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update featured products.', 'error');
      setPendingFeatured(featuredIds);
    }
  }, [pendingFeatured, featuredIds, showToast]);

  const handleToggleAvailability = useCallback(async (product: any) => {
    const newAvailable = product.available === false ? true : false;
    setTogglingAvailId(product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, available: newAvailable } : p))
    );
    if (!newAvailable) {
      setPendingFeatured((prev) => prev.filter((id) => id !== product.id));
    }
    try {
      const res = await productsService.toggleAvailability(product.id, newAvailable);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? res.data : p))
        );
        showToast(
          newAvailable
            ? `"${product.name}" is now live on the website.`
            : `"${product.name}" is now hidden from the website.`,
          'success'
        );
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, available: !newAvailable } : p))
        );
        showToast(res.message || 'Failed to update availability.', 'error');
      }
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, available: !newAvailable } : p))
      );
      showToast(err.response?.data?.message || 'Failed to update availability.', 'error');
    } finally {
      setTogglingAvailId(null);
    }
  }, [showToast]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsService.delete(deleteTarget.id);
      setPendingFeatured((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-5 sm:space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Manage Products
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, edit, or remove products from the catalog.
              </p>
            </div>
            <Button href="/admin/products/new" variant="primary" className="self-start sm:self-auto font-extrabold text-xs uppercase tracking-wider shadow-md shadow-teal-500/10 whitespace-nowrap">
              Add New Product
            </Button>
          </div>

          {/* Search + Featured save bar */}
          {!loading && !error && products.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-slate-50 border-slate-200 transition-all">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-star text-xs text-slate-300" />
                  <span className="text-xs font-bold text-slate-600">
                    Featured:
                  </span>
                  <span className={`text-xs font-extrabold ${pendingFeatured.length >= MAX_FEATURED ? 'text-amber-500' : 'text-teal-600'}`}>
                    {pendingFeatured.length} / {MAX_FEATURED}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Info hints */}
          {!loading && !error && products.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 w-fit">
                <i className="fa-solid fa-circle-info text-slate-300 text-[13px]" />
                <span>
                  Check the <strong className="text-slate-500">★</strong> column to select{' '}
                  <strong className="text-slate-500">{MAX_FEATURED} products</strong> for the home page{' '}
                  <strong className="text-slate-500">Featured</strong> section. Changes are saved automatically.
                </span>
              </div>
              <div className="flex md:hidden items-center gap-2 text-[11px] text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 w-fit">
                <i className="fa-solid fa-circle-info text-slate-300 text-[13px]" />
                <span>
                  Check the checkbox on a product card to select{' '}
                  <strong className="text-slate-500">{MAX_FEATURED} products</strong> for the home page{' '}
                  <strong className="text-slate-500">Featured</strong> section. Changes are saved automatically.
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 w-fit">
                <i className="fa-solid fa-grip-vertical text-slate-300 text-[13px]" />
                <span>
                  Use the <strong className="text-slate-500">grip icon</strong> on the left side of each row to drag and reorder products.
                </span>
              </div>
              <div className="flex md:hidden items-center gap-2 text-[11px] text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 w-fit">
                <i className="fa-solid fa-arrow-down-arrow-up text-slate-300 text-[13px]" />
                <span>
                  Use the <strong className="text-slate-500">up and down arrow buttons (▲ / ▼)</strong> on the right of each card to reorder products.
                </span>
              </div>
            </div>
          )}

          {/* Products Table */}
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold tracking-wide">Loading products...</span>
            </div>
          ) : error ? (
            <ErrorState onRetry={fetchProducts} description={error} />
          ) : products.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200/80">
              <i className="fa-solid fa-bone text-4xl text-slate-200 mb-3" />
              <p className="text-sm text-slate-500 font-semibold">No products in the catalog yet.</p>
              <p className="text-xs text-slate-400 mt-1">Click &quot;Add New Product&quot; to get started.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredProducts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                {/* Mobile View */}
                <div className="block md:hidden space-y-4">
                  {filteredProducts.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400">No products match your search.</div>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onDelete={setDeleteTarget}
                        featured={pendingFeatured}
                        onToggleFeatured={handleToggleFeatured}
                        featuredCount={pendingFeatured.length}
                        onToggleAvailability={handleToggleAvailability}
                        togglingId={togglingAvailId}
                        isSearchActive={!!searchQuery}
                        isFirst={index === 0}
                        isLast={index === filteredProducts.length - 1}
                        onMoveUp={(id: string) => handleMoveProduct(id, 'up')}
                        onMoveDown={(id: string) => handleMoveProduct(id, 'down')}
                        categoryName={getCategoryName(product.category)}
                      />
                    ))
                  )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block w-full overflow-x-auto rounded-2xl border border-slate-200/80 shadow-sm bg-white">
                  <table className="w-full text-left border-collapse min-w-[560px]">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80">
                        <th className="pl-4 py-3.5 w-10 text-center"></th>
                        <th className="pl-4 py-3.5 w-12 text-center">
                          <span className="text-teal-400" title="Pin to Featured on Home page">
                            <i className="fa-solid fa-star" />
                          </span>
                        </th>
                        <th className="px-2 py-3.5">Image</th>
                        <th className="px-3 py-3.5">Product Name</th>
                        <th className="px-3 py-3.5 hidden sm:table-cell">Category</th>
                        <th className="px-3 py-3.5">Price</th>
                        <th className="px-3 py-3.5">Visibility</th>
                        <th className="px-3 py-3.5 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-400">
                            No products match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => (
                          <ProductRow
                            key={product.id}
                            product={product}
                            onDelete={setDeleteTarget}
                            featured={pendingFeatured}
                            onToggleFeatured={handleToggleFeatured}
                            featuredCount={pendingFeatured.length}
                            onToggleAvailability={handleToggleAvailability}
                            togglingId={togglingAvailId}
                            isSearchActive={!!searchQuery}
                            categoryName={getCategoryName(product.category)}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Product?"
          description={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isDanger
          isLoading={deleting}
        />

        {/* Toast */}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AdminLayout>
    </AdminRoute>
  );
}

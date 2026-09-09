'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import ConfirmModal from '@/components/molecules/ConfirmModal';
import Button from '@/components/atoms/Button';
import Price from '@/components/atoms/Price';
import { MediaThumbnail } from '@/components/atoms/MediaRenderer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsService } from '@/services/items.service';
import { useCategoriesQuery } from '@/hooks/useCategories';
import { showToast } from '@/utils/toast';
import type { Item } from '@/types';

// Helper to safely extract category display text when item.category is string | Category
function getCategoryDisplay(item: Item): string {
  if (typeof item.category === 'object' && item.category !== null) {
    return item.category.name || item.category.slug || 'Uncategorized';
  }
  if (typeof item.category === 'string' && item.category.trim() !== '') {
    return item.category;
  }
  return item.categorySlug || 'Uncategorized';
}

// Sortable Table Row Component
interface SortableRowProps {
  item: Item;
  isFeatured: boolean;
  onToggleAvailability: (id: string, currentStatus: boolean) => void;
  onToggleFeatured: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

function SortableItemRow({
  item,
  isFeatured,
  onToggleAvailability,
  onToggleFeatured,
  onDeleteClick,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const isOutOfStock = item.available === false;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-slate-50/70 transition-colors ${
        isDragging ? 'bg-purple-50 shadow-md ring-1 ring-purple-300' : ''
      }`}
    >
      {/* 1. Featured Toggle (At Very Start) */}
      <td className="py-3 px-4 text-center w-16">
        <button
          onClick={() => onToggleFeatured(item.id)}
          disabled={isOutOfStock}
          className={`p-1.5 rounded-lg text-base transition-all ${
            isOutOfStock
              ? 'opacity-30 cursor-not-allowed text-slate-300'
              : isFeatured
              ? 'text-amber-500 hover:text-amber-600 cursor-pointer scale-110'
              : 'text-slate-300 hover:text-slate-500 cursor-pointer'
          }`}
          title={
            isOutOfStock
              ? 'Out of stock items cannot be featured'
              : isFeatured
              ? 'Click to remove from Featured'
              : 'Click to mark as Featured'
          }
        >
          ★
        </button>
      </td>

      {/* 2. Drag Handle (No arrows) */}
      <td className="py-3 px-3 w-12 text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition-all touch-none"
          title="Drag to reorder"
          aria-label="Drag to reorder item"
        >
          <i className="fa-solid fa-grip-vertical text-[14px]"></i>
        </button>
      </td>

      {/* 3. Image & Name */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
            <MediaThumbnail src={item.image} alt={item.name} />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-900 line-clamp-1">
              {item.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {item.id}
            </span>
          </div>
        </div>
      </td>

      {/* 4. Category */}
      <td className="py-3 px-4">
        <span className="inline-block px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold capitalize">
          {getCategoryDisplay(item)}
        </span>
      </td>

      {/* 5. Price */}
      <td className="py-3 px-4 font-extrabold text-slate-900">
        <Price amount={item.price} />
      </td>

      {/* 6. Status Live Toggle Switch */}
      <td className="py-3 px-4 text-center w-28 whitespace-nowrap">
        <div className="flex flex-col items-center justify-center gap-0.5 w-24 mx-auto">
          <button
            type="button"
            role="switch"
            aria-checked={!isOutOfStock}
            onClick={() => onToggleAvailability(item.id, !isOutOfStock)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              !isOutOfStock ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
            title={!isOutOfStock ? 'Click to set Out of Stock' : 'Click to set In Stock'}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                !isOutOfStock ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-[10px] font-extrabold select-none whitespace-nowrap text-center ${
              !isOutOfStock ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </td>

      {/* 7. Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/items/${item.id}/edit`}>
            <button className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" aria-label="Edit">
              <i className="fa-solid fa-pen text-[15px]" />
            </button>
          </Link>
          <button
            onClick={() => onDeleteClick(item.id)}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            aria-label="Delete"
          >
            <i className="fa-solid fa-trash text-[15px]" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Sortable Mobile Card Component for Small Screens
function SortableMobileItemCard({
  item,
  isFeatured,
  onToggleAvailability,
  onToggleFeatured,
  onDeleteClick,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const isOutOfStock = item.available === false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex transition-all ${
        isDragging ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-300 shadow-lg' : ''
      }`}
    >
      {/* Left Grip Handle Strip */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 flex items-center justify-center w-12 bg-slate-50 hover:bg-purple-50 border-r border-slate-200/80 cursor-grab active:cursor-grabbing touch-none transition-colors group"
        title="Drag to reorder"
        aria-label="Drag to reorder item"
      >
        <i className="fa-solid fa-grip-vertical text-slate-300 group-hover:text-purple-500 text-xl transition-colors" />
      </button>

      {/* Right Card Content */}
      <div className="flex-1 min-w-0 p-4 space-y-3.5">
        {/* Top Header Row: Category Badge & Featured Star */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold capitalize">
            {getCategoryDisplay(item)}
          </span>

          <button
            onClick={() => onToggleFeatured(item.id)}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center gap-1.5 border ${
              isOutOfStock
                ? 'opacity-30 cursor-not-allowed text-slate-300 border-slate-200'
                : isFeatured
                ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm scale-105'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
            }`}
            title={
              isOutOfStock
                ? 'Out of stock items cannot be featured'
                : isFeatured
                ? 'Click to unfeature'
                : 'Click to feature'
            }
          >
            <span className="text-base leading-none">★</span>
            <span>{isFeatured ? 'Featured' : 'Feature'}</span>
          </button>
        </div>

        {/* Item Info: Thumbnail, Name, ID & Price */}
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
            <MediaThumbnail src={item.image} alt={item.name} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-slate-900 text-sm truncate">{item.name}</h4>
            <p className="text-[10px] text-slate-400 font-mono">ID: {item.id}</p>
            <div className="mt-1 font-extrabold text-teal-600 text-sm">
              <Price amount={item.price} />
            </div>
          </div>
        </div>

        {/* Footer Controls: Availability Toggle & Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={!isOutOfStock}
              onClick={() => onToggleAvailability(item.id, !isOutOfStock)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                !isOutOfStock ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  !isOutOfStock ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-extrabold ${!isOutOfStock ? 'text-emerald-600' : 'text-slate-400'}`}>
              {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/items/${item.id}/edit`}>
              <button className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700 text-xs font-extrabold transition-colors">
                Edit
              </button>
            </Link>
            <button
              onClick={() => onDeleteClick(item.id)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-extrabold transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminItemsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  // Fetch categories for filtering
  const { data: categories = [] } = useCategoriesQuery();

  // Fetch items using React Query
  const itemsQuery = useQuery({
    queryKey: ['admin-items'],
    queryFn: async () => {
      const response = await itemsService.getAll({ all: true });
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch items.');
      }
      return response.data;
    },
    refetchOnMount: 'always',
  });

  // Fetch featured item IDs
  const featuredQuery = useQuery({
    queryKey: ['admin-featured-ids'],
    queryFn: async () => {
      const response = await itemsService.getFeaturedIds();
      return response.success && response.data ? response.data : [];
    },
  });

  const featuredIds = featuredQuery.data ?? [];
  const loading = itemsQuery.isLoading || featuredQuery.isLoading;
  const error = itemsQuery.error ? (itemsQuery.error as Error).message : null;

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Reorder mutation using pure React Query state & backend API
  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => itemsService.reorder(ids),
    onSuccess: (res) => {
      if (res.success) {
        showToast('success', 'Item order saved.');
        void queryClient.invalidateQueries({ queryKey: ['admin-items'] });
        void queryClient.invalidateQueries({ queryKey: ['items'] });
        void queryClient.invalidateQueries({ queryKey: ['featured-homepage-items'] });
      }
    },
    onError: () => {
      showToast('error', 'Failed to save item order.');
    },
  });

  // Toggle availability handler with optimistic React Query update
  const handleToggleAvailability = (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    queryClient.setQueryData<Item[]>(['admin-items'], (old) =>
      old ? old.map((item) => (item.id === id ? { ...item, available: newStatus } : item)) : []
    );

    // If item is set to Out of Stock, automatically remove from featured list if currently featured
    if (!newStatus && featuredIds.includes(id)) {
      const updatedFeatured = featuredIds.filter((fId) => fId !== id);
      void itemsService.setFeaturedIds(updatedFeatured).then(() => {
        void queryClient.invalidateQueries({ queryKey: ['admin-featured-ids'] });
        void queryClient.invalidateQueries({ queryKey: ['featured-homepage-items'] });
      });
      showToast('info', 'Item unfeatured because it is out of stock.');
    }

    toggleAvailabilityMutation.mutate({ id, available: newStatus });
  };

  // Toggle availability mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      itemsService.toggleAvailability(id, available),
    onSuccess: (res) => {
      if (res.success) {
        showToast('success', 'Status updated.');
        void queryClient.invalidateQueries({ queryKey: ['admin-items'] });
        void queryClient.invalidateQueries({ queryKey: ['items'] });
      } else {
        showToast('error', res.message || 'Failed to update status.');
        void queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      }
    },
    onError: (err: any) => {
      showToast('error', err.message || 'Error updating status.');
      void queryClient.invalidateQueries({ queryKey: ['admin-items'] });
    },
  });

  // Toggle featured handler with maximum 8 limit check & out-of-stock check
  const handleToggleFeatured = (itemId: string) => {
    const items = itemsQuery.data ?? [];
    const targetItem = items.find((i) => i.id === itemId);
    if (targetItem && targetItem.available === false) {
      showToast('error', 'Out of stock items cannot be featured.');
      return;
    }

    const isCurrentlyFeatured = featuredIds.includes(itemId);
    if (!isCurrentlyFeatured && featuredIds.length >= 8) {
      showToast('error', 'Maximum 8 featured items allowed. Unfeature another item first.');
      return;
    }

    toggleFeaturedMutation.mutate(itemId);
  };

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const current = new Set(featuredIds);
      if (current.has(itemId)) {
        current.delete(itemId);
      } else {
        current.add(itemId);
      }
      return itemsService.setFeaturedIds(Array.from(current));
    },
    onSuccess: (res) => {
      if (res.success) {
        showToast('success', 'Featured list updated.');
        void queryClient.invalidateQueries({ queryKey: ['admin-featured-ids'] });
        void queryClient.invalidateQueries({ queryKey: ['featured-homepage-items'] });
      } else {
        showToast('error', res.message || 'Failed to update featured items.');
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemsService.delete(id),
    onSuccess: (res) => {
      if (res.success) {
        showToast('success', 'Item deleted successfully.');
        setDeleteConfirmId(null);
        void queryClient.invalidateQueries({ queryKey: ['admin-items'] });
        void queryClient.invalidateQueries({ queryKey: ['items'] });
      } else {
        showToast('error', res.message || 'Failed to delete item.');
      }
    },
    onError: (err: any) => {
      showToast('error', err.message || 'Error deleting item.');
    },
  });

  // Filter items based on search term & category selection directly from React Query cache
  const itemsList = itemsQuery.data ?? [];
  const filteredItems = useMemo(() => {
    return itemsList.filter((item) => {
      const matchesSearch =
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const catVal =
        typeof item.category === 'object' && item.category !== null
          ? item.category.slug || item.category.name
          : item.category;

      const matchesCat =
        selectedCategory === 'all' ||
        catVal === selectedCategory ||
        item.category === selectedCategory ||
        item.categorySlug === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [itemsList, searchTerm, selectedCategory]);

  const filteredItemIds = useMemo(
    () => filteredItems.map((item) => item.id),
    [filteredItems]
  );

  // Reordering handlers using optimistic React Query cache updates
  const handleDragStart = (event: DragStartEvent) => {
    const item = itemsList.find((i) => i.id === event.active.id);
    if (item) setActiveItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over || active.id === over.id) return;

    const oldIndex = itemsList.findIndex((i) => i.id === active.id);
    const newIndex = itemsList.findIndex((i) => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(itemsList, oldIndex, newIndex);
      // Optimistically update React Query cache for instant visual feedback
      queryClient.setQueryData(['admin-items'], newItems);
      // Synchronize order with backend server
      const ids = newItems.map((i) => i.id);
      reorderMutation.mutate(ids);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Manage Items
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag and drop items to reorder your catalog display sequence.
              </p>
            </div>
            <Link href="/admin/items/new" className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto justify-center font-extrabold text-xs shadow-md shadow-teal-500/10 flex items-center gap-2 py-2.5"
              >
                <i className="fa-solid fa-plus text-[12px]"></i> Add New Item
              </Button>
            </Link>
          </div>

          {/* Search & Category Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-grow w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
              <input
                type="text"
                placeholder="Search items by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-56 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer capitalize"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug || cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tips Section Banners */}
          <div className="space-y-2">
            {/* Featured Items Limit Banner Tip */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-semibold text-amber-900">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-sm">⭐</span>
                <span>
                  <strong>Featured Limit:</strong> Maximum of <strong>8 featured items</strong> can be showcased on the home page.
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex-shrink-0">
                {featuredIds.length} / 8 Selected
              </span>
            </div>

            {/* Drag & Drop Reordering Tip Banner */}
            <div className="bg-purple-50/70 border border-purple-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-purple-800">
              <i className="fa-solid fa-hand text-purple-600"></i>
              <span>
                <strong>Drag & Drop tip:</strong> Grab the <i className="fa-solid fa-grip-vertical text-purple-600"></i> handle to reorder items in your catalog.
              </span>
            </div>
          </div>

          {/* Table Content with DndKit */}
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold tracking-wide">Loading items...</span>
            </div>
          ) : error ? (
            <ErrorState onRetry={() => itemsQuery.refetch()} description={error} />
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
              <span className="text-3xl">🐶</span>
              <h3 className="text-sm font-extrabold text-slate-800">No items found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchTerm || selectedCategory !== 'all'
                  ? 'No items match your selected filters. Try clearing your search.'
                  : 'Your catalog is currently empty. Click "Add New Item" to create one.'}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {/* Desktop Table View (md and up) */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                        <th className="py-3 px-4 text-center w-16">★</th>
                        <th className="py-3 px-3 w-12 text-center">Order</th>
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-center w-28 whitespace-nowrap">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={filteredItemIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {filteredItems.map((item) => (
                          <SortableItemRow
                            key={item.id}
                            item={item}
                            isFeatured={featuredIds.includes(item.id)}
                            onToggleAvailability={(id, currentStatus) =>
                              handleToggleAvailability(id, currentStatus)
                            }
                            onToggleFeatured={(id) => handleToggleFeatured(id)}
                            onDeleteClick={(id) => setDeleteConfirmId(id)}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </div>
              </div>

              {/* Mobile Card List View (< md) */}
              <div className="block md:hidden">
                <SortableContext
                  items={filteredItemIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3.5">
                    {filteredItems.map((item) => (
                      <SortableMobileItemCard
                        key={item.id}
                        item={item}
                        isFeatured={featuredIds.includes(item.id)}
                        onToggleAvailability={(id, currentStatus) =>
                          handleToggleAvailability(id, currentStatus)
                        }
                        onToggleFeatured={(id) => handleToggleFeatured(id)}
                        onDeleteClick={(id) => setDeleteConfirmId(id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>

              <DragOverlay>
                {activeItem ? (
                  <div className="bg-white p-3.5 rounded-2xl border border-purple-300 shadow-2xl flex items-center gap-3 opacity-95 ring-2 ring-purple-400">
                    <i className="fa-solid fa-grip-vertical text-purple-600"></i>
                    <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                      <MediaThumbnail src={activeItem.image} alt={activeItem.name} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-xs text-slate-900 block truncate">{activeItem.name}</span>
                      <span className="text-[10px] text-teal-600 font-extrabold"><Price amount={activeItem.price} /></span>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}

          {/* Delete Confirmation Modal */}
          <ConfirmModal
            isOpen={!!deleteConfirmId}
            onClose={() => setDeleteConfirmId(null)}
            onConfirm={() => {
              if (deleteConfirmId) deleteMutation.mutate(deleteConfirmId);
            }}
            title="Delete Item?"
            description="Are you sure you want to delete this item? This action cannot be undone."
            confirmLabel="Delete"
            isDanger
            isLoading={deleteMutation.isPending}
          />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

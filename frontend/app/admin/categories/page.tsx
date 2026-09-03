'use client';

import { useState } from 'react';
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
import Button from '@/components/atoms/Button';
import ConfirmModal from '@/components/molecules/ConfirmModal';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import ImageUploader from '@/components/molecules/ImageUploader';
import {
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
} from '@/hooks/useCategories';
import { showToast } from '@/utils/toast';

interface Category {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isAccessory?: boolean;
  parentId?: string | null;
}

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  image: string;
  isAccessory: boolean;
}

const EMPTY_FORM: CategoryForm = { name: '', slug: '', description: '', image: '', isAccessory: false };

function slugify(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return str?.startsWith('/');
  }
}

// ─── Shared category image ────────────────────────────────────────────────────
function CategoryImage({ category, size = 'md' }: { category: Category; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  return (
    <div className={`relative ${sizeClass} rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 shadow-inner`}>
      {category.image && isValidUrl(category.image) ? (
        <img src={category.image} alt={category.name} className="object-cover w-full h-full" />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-[9px] font-semibold text-slate-400 select-none">No Img</div>
      )}
    </div>
  );
}

// ─── Sortable Card Row (mobile) ───────────────────────────────────────────────
function SortableCategoryCard({ category, categories, onEdit, onDelete, isFirst, isLast, onMoveUp, onMoveDown }: {
  category: Category;
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: (id: string | undefined) => void;
  onMoveDown: (id: string | undefined) => void;
}) {
  const categoryId = String(category.id || category._id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: categoryId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-3 py-2.5 bg-white border-b border-slate-100 transition-colors ${isDragging ? 'bg-teal-50/40' : ''}`}
    >
      <CategoryImage category={category} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-extrabold text-slate-900 truncate">{category.name}</p>
          {category.isAccessory && (
            <span className="text-[8px] font-extrabold text-purple-600 bg-purple-50 border border-purple-100 rounded-full px-1.5 py-0.5">
              Pet&apos;s Accessory
            </span>
          )}
        </div>
        {category.description && <p className="text-[10px] text-slate-400 truncate">{category.description}</p>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={() => onEdit(category)} className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" aria-label="Edit">
          <i className="fa-solid fa-pen text-[15px]" />
        </button>
        <button onClick={() => onDelete(category)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" aria-label="Delete">
          <i className="fa-solid fa-trash text-[15px]" />
        </button>
      </div>

      {/* Reorder arrows — right side, stacked vertically */}
      <div className="flex flex-col items-center justify-center gap-1 pl-2 border-l border-slate-100 flex-shrink-0">
        <button
          onClick={() => onMoveUp(category.id || category._id)}
          disabled={isFirst}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-teal-500 hover:border-teal-300 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all active:scale-90"
          title="Move up"
        >
          <i className="fa-solid fa-chevron-up text-[10px]" />
        </button>
        <button
          onClick={() => onMoveDown(category.id || category._id)}
          disabled={isLast}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-teal-500 hover:border-teal-300 disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:cursor-not-allowed transition-all active:scale-90"
          title="Move down"
        >
          <i className="fa-solid fa-chevron-down text-[10px]" />
        </button>
      </div>
    </div>
  );
}

// ─── Sortable Table Row (desktop) ─────────────────────────────────────────────
function SortableCategoryRow({ category, categories, onEdit, onDelete, isDragOverlay }: {
  category: Category;
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  isDragOverlay?: boolean;
}) {
  const categoryId = String(category.id || category._id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: categoryId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 transition-colors group ${
        isDragging ? 'bg-teal-50/40' : 'hover:bg-slate-50/60'
      } ${isDragOverlay ? 'shadow-2xl rounded-xl bg-white ring-2 ring-teal-400/40' : ''}`}
    >
      <td className="pl-4 py-3 w-10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 text-slate-300 hover:text-slate-500 rounded-lg hover:bg-slate-100 transition-all touch-none" aria-label="Drag to reorder">
          <i className="fa-solid fa-grip-vertical text-[14px]" />
        </button>
      </td>
      <td className="px-4 py-3"><CategoryImage category={category} /></td>
      <td className="px-4 py-3 font-extrabold text-slate-900 text-xs text-balance">
        <div className="flex items-center gap-2">
          <span>{category.name}</span>
          {category.isAccessory && (
            <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 border border-purple-100 rounded-full px-1.5 py-0.5 whitespace-nowrap">
              Pet&apos;s Accessory
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs max-w-[240px] truncate">{category.description || <span className="italic text-slate-300">—</span>}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(category)} className="px-3 py-1.5 text-[11px] font-bold text-slate-600 border border-slate-200 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">Edit</button>
          <button onClick={() => onDelete(category)} className="px-3 py-1.5 text-[11px] font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg transition-all">Delete</button>
        </div>
      </td>
    </tr>
  );
}

// ─── Full-page Category Form ────────────────────────────────────────────────
function CategoryFormPage({ initial, onBack, onSave, existingSlugs, isSubmitting }: {
  initial: Category | null;
  onBack: () => void;
  onSave: (form: any) => void;
  existingSlugs: string[];
  isSubmitting: boolean;
}) {
  const isEdit = !!initial;

  const [form, setForm] = useState<CategoryForm>(
    initial
      ? {
          name: initial.name || '',
          slug: initial.slug || '',
          description: initial.description || '',
          image: initial.image || '',
          isAccessory: initial.isAccessory || false,
        }
      : { name: '', slug: '', description: '', image: '', isAccessory: false }
  );
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const set = (field: keyof CategoryForm, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'name' && !isEdit) next.slug = slugify(value as string);
      return next;
    });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!isEdit && existingSlugs.includes(form.slug)) errs.slug = 'A category with this name already exists.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({ ...form, isAccessory: form.isAccessory, parentId: null });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
          aria-label="Back"
        >
          <i className="fa-solid fa-arrow-left text-[15px]" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? 'Edit Category' : 'Add New Category'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEdit ? 'Update the category details below.' : 'Fill in the category information below.'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Dog Accessories"
              className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${errors.name ? 'border-rose-400' : 'border-slate-200'}`}
            />
            {errors.name && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.name}</p>}
            {errors.slug && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.slug}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              id="cat-description"
              type="text"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="e.g. Collars, leads, toys..."
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 py-2 border-t border-slate-100">
          <input
            id="isAccessory"
            type="checkbox"
            checked={form.isAccessory}
            onChange={(e) => set('isAccessory', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
          />
          <label htmlFor="isAccessory" className="text-xs font-bold text-slate-700 tracking-wide cursor-pointer select-none">
            Is this a pet&apos;s accessory?
          </label>
        </div>

        <ImageUploader label="Category Image" value={form.image} onChange={(url: string) => set('image', url)} />

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="text-xs font-extrabold px-6">
            {isEdit ? 'Save Changes' : 'Add Category'}
          </Button>
        </div>
      </form>
    </div>
  );
}


// ─── Main Page ──────────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading, error, refetch } = useCategoriesQuery();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const reorderMutation = useReorderCategories();

  // view: 'list' | 'add' | category object (edit)
  const [view, setView] = useState<'list' | 'add' | Category>('list');
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSave = async (form: any) => {
    try {
      if (view === 'add') {
        await createMutation.mutateAsync(form);
        showToast('success', 'Category added successfully!');
      } else {
        const targetId = String((view as Category).id || (view as Category)._id);
        await updateMutation.mutateAsync({ id: targetId, data: form });
        showToast('success', 'Category updated successfully!');
      }
      setView('list');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to save category.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const targetId = String(deleteTarget.id || deleteTarget._id);
      await deleteMutation.mutateAsync(targetId);
      showToast('success', 'Category deleted successfully!');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to delete category.');
    }
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c: Category) => String(c.id || c._id) === String(active.id));
    const newIndex = categories.findIndex((c: Category) => String(c.id || c._id) === String(over.id));

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedList = arrayMove(categories, oldIndex, newIndex);
    const orderedIds = reorderedList.map((c: Category) => String(c.id || c._id));

    try {
      await reorderMutation.mutateAsync(orderedIds);
      showToast('success', 'Category order updated!');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to persist category order.');
    }
  };

  const handleMoveUp = async (id: string | undefined) => {
    const oldIndex = categories.findIndex((c: Category) => String(c.id || c._id) === String(id));
    if (oldIndex <= 0) return;
    const reorderedList = arrayMove(categories, oldIndex, oldIndex - 1);
    const orderedIds = reorderedList.map((c: Category) => String(c.id || c._id));
    try {
      await reorderMutation.mutateAsync(orderedIds);
      showToast('success', 'Category order updated!');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to persist category order.');
    }
  };

  const handleMoveDown = async (id: string | undefined) => {
    const oldIndex = categories.findIndex((c: Category) => String(c.id || c._id) === String(id));
    if (oldIndex === -1 || oldIndex >= categories.length - 1) return;
    const reorderedList = arrayMove(categories, oldIndex, oldIndex + 1);
    const orderedIds = reorderedList.map((c: Category) => String(c.id || c._id));
    try {
      await reorderMutation.mutateAsync(orderedIds);
      showToast('success', 'Category order updated!');
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to persist category order.');
    }
  };

  const existingSlugs = categories.map((c: Category) => c.slug);
  const activeCategory = activeId ? categories.find((c: Category) => String(c.id || c._id) === activeId) : null;
  const isMutating = createMutation.isPending || updateMutation.isPending;

  const sortableIds = categories.map((c: Category) => String(c.id || c._id));

  // ── If in add/edit view, render the full-page form instead of the list ──
  if (view !== 'list') {
    return (
      <AdminRoute>
        <AdminLayout>
          <CategoryFormPage
            initial={view === 'add' ? null : view as Category}
            onBack={() => setView('list')}
            onSave={handleSave}
            existingSlugs={existingSlugs}
            isSubmitting={isMutating}
          />
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Manage Categories</h1>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Add, edit, reorder, or remove product categories dynamically.</p>
            </div>
            <Button
              id="add-category-btn"
              variant="primary"
              className="font-extrabold text-xs uppercase tracking-wider shadow-md shadow-teal-500/10 flex-shrink-0"
              onClick={() => setView('add')}
            >
              <span className="hidden sm:inline">Add New Category</span>
              <span className="sm:hidden"><i className="fa-solid fa-plus mr-1" />Add</span>
            </Button>
          </div>

          {/* DnD hint */}
          {!isLoading && !error && categories.length > 1 && (
            <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 w-fit">
              <i className="fa-solid fa-grip-vertical text-slate-300 text-[12px]" />
              <span>Drag the <strong className="text-slate-500">grip handle</strong> to reorder</span>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold tracking-wide">Loading categories...</span>
            </div>
          ) : error ? (
            <ErrorState onRetry={refetch} description={(error as Error).message || 'Failed to load categories.'} />
          ) : categories.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-2xl mb-2">🐾</p>
              <p className="text-sm font-bold text-slate-500">No categories found.</p>
              <p className="text-xs text-slate-400 mt-1">Click &quot;Add New Category&quot; to get started.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>

                {/* Mobile: compact card list */}
                <div className="md:hidden rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
                  {categories.map((cat: Category, index: number) => (
                    <SortableCategoryCard
                      key={cat.id || cat._id || cat.slug}
                      category={cat}
                      categories={categories}
                      onEdit={setView as any}
                      onDelete={setDeleteTarget}
                      isFirst={index === 0}
                      isLast={index === categories.length - 1}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                    />
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block w-full rounded-2xl border border-slate-200/80 shadow-sm bg-white overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80">
                        <th className="pl-4 py-3.5 w-10"><i className="fa-solid fa-arrows-up-down text-slate-300 text-[12px]" /></th>
                        <th className="px-4 py-4">Image</th>
                        <th className="px-4 py-4">Name</th>
                        <th className="px-4 py-4">Description</th>
                        <th className="px-4 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat: Category) => (
                        <SortableCategoryRow
                          key={cat.id || cat._id || cat.slug}
                          category={cat}
                          categories={categories}
                          onEdit={setView as any}
                          onDelete={setDeleteTarget}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

              </SortableContext>

              {/* Drag overlay */}
              <DragOverlay>
                {activeCategory ? (
                  <div className="bg-white rounded-xl shadow-2xl ring-2 ring-teal-400/40 px-3 py-2.5 flex items-center gap-3">
                    <i className="fa-solid fa-grip-vertical text-slate-300 text-[13px]" />
                    <CategoryImage category={activeCategory} size="sm" />
                    <span className="text-xs font-extrabold text-slate-900">{activeCategory.name}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Delete Confirm Modal with Cascade Delete warning */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Category & All Products?"
          description={`WARNING: Deleting the category "${deleteTarget?.name}" will PERMANENTLY delete the category itself AND ALL PRODUCTS associated with it. This action cannot be undone.`}
          confirmLabel="Delete Category & Products"
          isDanger
          isLoading={deleteMutation.isPending}
        />
      </AdminLayout>
    </AdminRoute>
  );
}

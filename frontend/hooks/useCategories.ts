import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryTreeNode } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Dogs',
    slug: 'dogs',
    description: 'Loyal, protective, and energetic canine companions.',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1074&auto=format&fit=crop',
    order: 0,
  },
  {
    id: '2',
    name: 'Cats',
    slug: 'cats',
    description: 'Independent, curious, and graceful feline companions.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1043&auto=format&fit=crop',
    order: 1,
  },
  {
    id: '3',
    name: 'Birds',
    slug: 'birds',
    description: 'Intelligent, active, and colorful feathered companions.',
    image: '/images/birds-category.jpg',
    order: 2,
  },
  {
    id: '5',
    name: 'Hamster',
    slug: 'hamster',
    description: 'Cute, small, and active pocket rodents.',
    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?q=80&w=1076&auto=format&fit=crop',
    order: 3,
  },
  {
    id: '6',
    name: 'Reptiles',
    slug: 'reptiles',
    description: 'Cold-blooded, fascinating, and quiet exotic pets.',
    image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    order: 4,
  },
  {
    id: '4',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Leashes, collars, food bowls, carriers, and grooming accessories.',
    image: '/images/accessories-category.jpg',
    order: 5,
  },
];

export function useCategoriesQuery(): UseQueryResult<Category[]> {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      try {
        const res = await categoriesService.getAll();
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          return res.data.map((c: any) => ({
            ...c,
            id: String(c.id || c._id),
          }));
        }
      } catch (err) {
        console.warn('Categories API failed, using default categories:', err);
      }
      return DEFAULT_CATEGORIES;
    },
    placeholderData: DEFAULT_CATEGORIES,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, CreateCategoryInput>({
    mutationFn: async (data: CreateCategoryInput): Promise<Category> => {
      let created: Category | null = null;
      try {
        const res = await categoriesService.create(data);
        if (res?.success && res.data) {
          created = { ...res.data, id: String(res.data.id || res.data._id) };
        }
      } catch (err) {
        console.warn('Backend create category failed, inserting into React Query cache:', err);
      }

      const current = queryClient.getQueryData<Category[]>(['categories']) || DEFAULT_CATEGORIES;
      if (!created) {
        const maxOrder = current.reduce((max, c) => Math.max(max, c.order ?? 0), -1);
        created = {
          id: Date.now().toString(),
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          image: data.image || '',
          order: maxOrder + 1,
          parentId: data.parentId || null,
          isAccessory: Boolean(data.isAccessory),
        };
      }

      const updated = [...current, created];
      queryClient.setQueryData(['categories'], updated);
      return created;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, { id: string; data: UpdateCategoryInput }>({
    mutationFn: async ({ id, data }): Promise<Category> => {
      let updatedItem: Category | null = null;
      const targetId = String(id);
      try {
        const res = await categoriesService.update(targetId, data);
        if (res?.success && res.data) {
          updatedItem = { ...res.data, id: String(res.data.id || res.data._id) };
        }
      } catch (err) {
        console.warn('Backend update category failed, updating React Query cache:', err);
      }

      const current = queryClient.getQueryData<Category[]>(['categories']) || DEFAULT_CATEGORIES;
      const updatedList = current.map((cat) => {
        if (String(cat.id || cat._id) === targetId) {
          return updatedItem || { ...cat, ...data, id: targetId };
        }
        return cat;
      });

      queryClient.setQueryData(['categories'], updatedList);
      return updatedItem || ({ ...data, id: targetId } as Category);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id: string) => {
      const targetId = String(id);
      try {
        await categoriesService.delete(targetId);
      } catch (err) {
        console.warn('Backend delete category failed, removing from React Query cache:', err);
      }

      const current = queryClient.getQueryData<Category[]>(['categories']) || DEFAULT_CATEGORIES;
      const updatedList = current.filter((cat) => String(cat.id || cat._id) !== targetId);

      queryClient.setQueryData(['categories'], updatedList);
      return { success: true };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      void queryClient.invalidateQueries({ queryKey: ['items'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-items'] });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation<Category[], Error, string[]>({
    mutationFn: async (orderedIds: string[]): Promise<Category[]> => {
      try {
        await categoriesService.reorder(orderedIds);
      } catch (err) {
        console.warn('Backend reorder categories failed, updating React Query cache:', err);
      }

      const current = queryClient.getQueryData<Category[]>(['categories']) || DEFAULT_CATEGORIES;
      const reordered: Category[] = orderedIds
        .map((id, idx): Category | null => {
          const item = current.find((c) => String(c.id || c._id) === String(id));
          return item ? { ...item, order: idx } : null;
        })
        .filter((c): c is Category => c !== null);

      queryClient.setQueryData(['categories'], reordered);
      return reordered;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useAccessoriesTree() {
  const { data: categories = [], isLoading } = useCategoriesQuery();

  const tree: CategoryTreeNode[] = categories
    .filter((c) => c.isAccessory)
    .map((c) => ({
      id: c.id || c._id || '',
      name: c.name,
      slug: c.slug,
      image: c.image,
      description: c.description,
      subcategories: [],
    }));

  return { tree, isLoading };
}

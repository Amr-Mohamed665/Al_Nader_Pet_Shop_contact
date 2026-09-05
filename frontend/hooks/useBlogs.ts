import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { blogsService } from '@/services/blogs.service';
import type { BlogPost, CreateBlogPostInput, UpdateBlogPostInput } from '@/types';

export function useBlogsQuery(params?: { search?: string; category?: string }): UseQueryResult<BlogPost[]> {
  return useQuery({
    queryKey: ['blogs', params?.search || '', params?.category || ''],
    queryFn: async () => {
      const res = await blogsService.getAll(params);
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useBlogQuery(slugOrId: string): UseQueryResult<BlogPost | null> {
  return useQuery({
    queryKey: ['blog', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      const res = await blogsService.getBySlugOrId(slugOrId);
      return res.success && res.data ? res.data : null;
    },
    enabled: Boolean(slugOrId),
  });
}

export function useCreateBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogPostInput) => blogsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useUpdateBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostInput }) => blogsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
    },
  });
}

export function useDeleteBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

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
    staleTime: 0,
    refetchOnMount: 'always',
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
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useCreateBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlogPostInput) => blogsService.create(data),
    onSuccess: (res) => {
      if (res?.success && res.data) {
        queryClient.setQueryData<BlogPost[]>(['blogs', '', ''], (old) =>
          old ? [res.data, ...old] : [res.data]
        );
      }
      void queryClient.invalidateQueries({ queryKey: ['blogs'], refetchType: 'all' });
    },
  });
}

export function useUpdateBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlogPostInput }) => blogsService.update(id, data),
    onSuccess: (res, variables) => {
      if (res?.success && res.data) {
        queryClient.setQueryData<BlogPost[]>(['blogs', '', ''], (old) =>
          old ? old.map((b) => (b.id === variables.id ? { ...b, ...res.data } : b)) : [res.data]
        );
        queryClient.setQueryData(['blog', variables.id], res.data);
      }
      void queryClient.invalidateQueries({ queryKey: ['blogs'], refetchType: 'all' });
      void queryClient.invalidateQueries({ queryKey: ['blog', variables.id], refetchType: 'all' });
    },
  });
}

export function useDeleteBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogsService.delete(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<BlogPost[]>(['blogs', '', ''], (old) =>
        old ? old.filter((b) => b.id !== id) : []
      );
      void queryClient.invalidateQueries({ queryKey: ['blogs'], refetchType: 'all' });
    },
  });
}

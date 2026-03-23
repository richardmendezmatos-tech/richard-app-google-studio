import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/entities/blog/api/blogService';
import { BlogPost } from '@/shared/types/types';

export const BLOG_QUERY_KEY = ['blog_posts'];

/**
 * Hook para obtener los artículos de la colección de blog_posts.
 */
export const useBlogPosts = (maxResults = 50) => {
  return useQuery({
    queryKey: [...BLOG_QUERY_KEY, maxResults],
    queryFn: () => blogService.getBlogPosts(maxResults),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

/**
 * Hook para crear un artículo nuevo de manera optimista.
 */
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPost: Omit<BlogPost, 'id'>) => blogService.createBlogPost(newPost),
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: BLOG_QUERY_KEY });
      const previousPosts = queryClient.getQueryData<BlogPost[]>(BLOG_QUERY_KEY);

      // Optimistic update
      queryClient.setQueryData<BlogPost[]>(BLOG_QUERY_KEY, (old) => {
        const optimisticPost: BlogPost = { id: `temp-${Date.now()}`, ...newPost };
        return old ? [optimisticPost, ...old] : [optimisticPost];
      });

      return { previousPosts };
    },
    onError: (_err, _newPost, context) => {
      // Revert if error
      if (context?.previousPosts) {
        queryClient.setQueryData(BLOG_QUERY_KEY, context.previousPosts);
      }
    },
    onSettled: () => {
      // Sync strictly with server after it settles
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEY });
    },
  });
};

/**
 * Hook para eliminar un artículo del blog.
 */
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => blogService.deleteBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEY });
    },
  });
};

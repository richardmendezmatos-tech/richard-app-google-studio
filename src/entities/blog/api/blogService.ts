import { BlogPost } from '@/shared/types/types';
import { SupabaseBlogRepository } from './repositories/SupabaseBlogRepository';

export const blogService = {
  /**
   * Obtiene los posts del blog - Migrado a Supabase
   */
  async getBlogPosts(maxResults = 50): Promise<BlogPost[]> {
    const repository = new SupabaseBlogRepository();
    return await repository.getBlogPosts(maxResults);
  },

  /**
   * Guarda un nuevo artículo - Migrado a Supabase
   */
  async createBlogPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    const repository = new SupabaseBlogRepository();
    return await repository.createBlogPost(post);
  },

  /**
   * Elimina un artículo - Migrado a Supabase
   */
  async deleteBlogPost(id: string): Promise<void> {
    const repository = new SupabaseBlogRepository();
    await repository.deleteBlogPost(id);
  },
};

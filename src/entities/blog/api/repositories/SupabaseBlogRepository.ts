import { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';
import { BlogPost } from '@/shared/types/types';

export class SupabaseBlogRepository {
  private client: SupabaseClient;
  private tableName = 'blog_posts';

  constructor(client?: SupabaseClient) {
    this.client = client || createServerSupabaseClient();
  }

  async getBlogPosts(maxResults = 50): Promise<BlogPost[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .order('date', { ascending: false })
      .limit(maxResults);

    if (error) {
      console.error('[SupabaseBlogRepository] Error fetching posts:', error);
      return [];
    }

    return (data || []) as BlogPost[];
  }

  async createBlogPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    const { data, error } = await this.client
      .from(this.tableName)
      .insert([
        {
          ...post,
          created_at: new Date().toISOString(),
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('[SupabaseBlogRepository] Error creating post:', error);
      throw error;
    }

    return data as BlogPost;
  }

  async deleteBlogPost(id: string): Promise<void> {
    const { error } = await this.client.from(this.tableName).delete().eq('id', id);

    if (error) {
      console.error(`[SupabaseBlogRepository] Error deleting post ${id}:`, error);
      throw error;
    }
  }
}

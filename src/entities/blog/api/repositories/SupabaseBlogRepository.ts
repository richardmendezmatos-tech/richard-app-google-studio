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
    if (!this.client) return [];

    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(maxResults);

    if (error) {
      console.error('[SupabaseBlogRepository] Error fetching posts:', error);
      return [];
    }

    return (data || []).map((post: any) => ({
      ...post,
      date: post.published_at ? post.published_at.split('T')[0] : (post.created_at ? post.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
      metaDescription: post.meta_description,
      estimatedReadingTime: post.estimated_reading_time,
      imageUrl: post.image_url || post.imageUrl,
    })) as BlogPost[];
  }

  async createBlogPost(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    if (!this.client) throw new Error('[SupabaseBlogRepository] No database client available');

    const { data, error } = await this.client
      .from(this.tableName)
      .insert([
        {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          tags: post.tags,
          meta_description: post.metaDescription,
          estimated_reading_time: post.estimatedReadingTime,
          image_url: post.imageUrl,
          published_at: new Date().toISOString(),
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
    if (!this.client) throw new Error('[SupabaseBlogRepository] No database client available');

    const { error } = await this.client.from(this.tableName).delete().eq('id', id);

    if (error) {
      console.error(`[SupabaseBlogRepository] Error deleting post ${id}:`, error);
      throw error;
    }
  }
}

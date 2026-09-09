import { supabase } from '@/integrations/supabase/client';

export interface PostsQuery {
  category?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
  fields?: string[];
}

export interface PaginatedResult<T> {
  data: T[] | null;
  error: any;
  hasMore: boolean;
  nextOffset: number;
}

export const optimizedPostsService = {
  // Optimized posts fetch with pagination and minimal data
  async getPostsPaginated(options: PostsQuery = {}): Promise<PaginatedResult<any>> {
    const {
      category,
      sortBy = 'latest',
      limit = 10,
      offset = 0,
      fields = ['minimal'] // 'minimal' | 'full' | 'preview'
    } = options;

    // Define field selections based on use case - now includes image_url, document_url and document_name
    const fieldSelections = {
      minimal: `
        id, content, created_at, author_id, likes_count, comments_count, reposts_count, shares_count, location, image_url, document_url, document_name,
        profiles!posts_author_id_fkey(id, full_name, avatar, profession)
      `,
      preview: `
        id, content, created_at, author_id, likes_count, comments_count, reposts_count, shares_count, location, image_url, document_url, document_name,
        profiles!posts_author_id_fkey(id, full_name, avatar, profession, organization)
      `,
      full: `
        *,
        profiles!posts_author_id_fkey(*),
        likes_count, comments_count, reposts_count, shares_count
      `
    };

    let query = supabase
      .from('posts')
      .select(fieldSelections[fields[0] as keyof typeof fieldSelections] || fieldSelections.minimal)
      .range(offset, offset + limit - 1);
    
    // Apply category filter
    if (category && category !== 'all' && category !== 'latest') {
      const categoryMap: { [key: string]: string } = {
        'industry': 'industry',
        'projects': 'project',
        'opportunities': 'opportunity'
        // 'news': 'general',
        // 'jobs': 'career', 
        // 'portfolios': 'project'
      };
      const dbCategory = categoryMap[category] || category;
      query = query.eq('location', dbCategory);
    }
    
    // Apply sorting
    if (sortBy === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('likes_count', { ascending: false });
    }
    
    const { data, error, count } = await query;
    
    const hasMore = data ? data.length === limit : false;
    const nextOffset = offset + limit;
    
    return { 
      data, 
      error, 
      hasMore,
      nextOffset
    };
  },

  // Prefetch post data on hover
  async prefetchPost(postId: string) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(*),
          likes_count, comments_count, reposts_count, shares_count
        `)
        .eq('id', postId)
        .single();
      
      if (!error) {
        // Cache in browser memory for quick access
        const cacheKey = `post_${postId}`;
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      }
      
      return { data, error };
    } catch (error) {
      console.error('Prefetch error:', error);
      return { data: null, error };
    }
  },

  // Get cached post data
  getCachedPost(postId: string) {
    try {
      const cacheKey = `post_${postId}`;
      const cached = sessionStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  },

  // Get optimized image URL for data saver mode
  getOptimizedImageUrl(originalUrl: string, options: { width?: number; quality?: number; format?: string } = {}) {
    if (!originalUrl) return '';
    
    const { width = 400, quality = 70, format = 'webp' } = options;
    
    // If using Supabase storage, add transformation parameters
    if (originalUrl.includes('supabase')) {
      const url = new URL(originalUrl);
      url.searchParams.set('width', width.toString());
      url.searchParams.set('quality', quality.toString());
      if (format) url.searchParams.set('format', format);
      return url.toString();
    }
    
    return originalUrl;
  },

  // Get lightweight post interactions using secure functions
  async getPostInteractionsOptimized(postIds: string[], userId: string) {
    if (!userId || postIds.length === 0) return { data: {}, error: null };
    
    // Use the secure function for each post
    const interactions: { [postId: string]: { liked: boolean; bookmarked: boolean; reposted: boolean } } = {};
    
    try {
      // Initialize all posts
      postIds.forEach(postId => {
        interactions[postId] = { liked: false, bookmarked: false, reposted: false };
      });

      // Fetch interactions for each post using the secure function
      const promises = postIds.map(async (postId) => {
        const { data, error } = await supabase
          .rpc('get_user_post_interactions', { post_id_param: postId });
        
        if (!error && data?.[0]) {
          const result = data[0];
          interactions[postId] = {
            liked: result.has_liked || false,
            bookmarked: result.has_bookmarked || false,
            reposted: result.has_reposted || false
          };
        }
      });

      await Promise.all(promises);
      return { data: interactions, error: null };
      
    } catch (error) {
      console.error('Error fetching optimized interactions:', error);
      return { data: interactions, error };
    }
  }
};
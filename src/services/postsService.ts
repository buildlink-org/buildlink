import { supabase } from '@/integrations/supabase/client';

export const postsService = {
  async getPosts(category?: string, sortBy: string = 'latest') {
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar,
          profession,
          user_type,
          title
        ),
        likes_count,
        comments_count,
        reposts_count
      `);
    
    if (category && category !== 'all' && category !== 'latest') {
      // Map filter categories to database categories
      const categoryMap: { [key: string]: string } = {
        'news': 'general',
        'jobs': 'career',
        'portfolios': 'project'
      };
      const dbCategory = categoryMap[category] || category;
      query = query.ilike('content', `%${dbCategory}%`);
    }
    
    if (sortBy === 'latest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('likes_count', { ascending: false });
    }
    
    const { data, error } = await query;
    
    return { data, error };
  },
  async createPost(post: {
    title?: string;
    content: string;
    category: string;
    image_url?: string;
    document_url?: string;
    document_name?: string;
    user_id: string;
  }) {
    const insertObj: any = {
      author_id: post.user_id,
      content: post.content,
      location: post.category,
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0,
    };
    if (post.image_url) {
      insertObj.image_url = post.image_url;
    }
    if (post.document_url) {
      insertObj.document_url = post.document_url;
    }
    if (post.document_name) {
      insertObj.document_name = post.document_name;
    }
    const { data, error } = await supabase
      .from('posts')
      .insert(insertObj)
      .select()
      .single();
    console.log('Create post result:', { data, error });
    return { data, error };
  },
  async likePost(postId: string, userId: string) {
    // First check if already liked
    const { data: existingLike } = await supabase
      .from('post_interactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('type', 'like')
      .single();

    if (existingLike) {
      // Unlike
      const { data, error } = await supabase
        .from('post_interactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('type', 'like');
      return { data, error, action: 'unliked' };
    } else {
      // Like
      const { data, error } = await supabase
        .from('post_interactions')
        .insert({ post_id: postId, user_id: userId, type: 'like' })
        .select()
        .single();
      return { data, error, action: 'liked' };
    }
  },
  // SECURE: Use new privacy-focused function to get user interactions
  async getUserInteractions(postId: string, userId: string) {
    if (!userId) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .rpc('get_user_post_interactions', { post_id_param: postId });
    
    if (error) {
      console.error('Error fetching user interactions:', error);
      return { data: [], error };
    }

    // Convert the secure function result to the expected format
    const interactions = [];
    if (data?.[0]) {
      const result = data[0];
      if (result.has_liked) interactions.push({ type: 'like' });
      if (result.has_bookmarked) interactions.push({ type: 'bookmark' });
      if (result.has_reposted) interactions.push({ type: 'repost' });
    }

    return { data: interactions, error: null };
  },
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar,
          profession,
          user_type
        )
      `)
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },
  async createComment(commentData: {
    post_id: string;
    author_id: string;
    content: string;
    parent_id?: string;
  }) {
    const { data, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar,
          profession,
          user_type
        )
      `)
      .single();
    
    return { data, error };
  },
  async repostPost(postId: string, userId: string, comment?: string) {
    // Check if already reposted
    const { data: existingRepost } = await supabase
      .from('reposts')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingRepost) {
      // Remove repost
      const { data, error } = await supabase
        .from('reposts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      return { data, error, action: 'unreposted' };
    } else {
      // Add repost
      const { data, error } = await supabase
        .from('reposts')
        .insert({ post_id: postId, user_id: userId, comment })
        .select()
        .single();
      return { data, error, action: 'reposted' };
    }
  },
  async sharePost(postId: string) {
    // Get post data for sharing
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar,
          profession,
          user_type
        )
      `)
      .eq('id', postId)
      .single();

    if (error) return { data: null, error };

    // Create share URL
    const shareUrl = `${window.location.origin}/?post=${postId}`;
    const shareText = `Check out this post by ${post.profiles?.full_name}: ${post.content.substring(0, 100)}...`;

    return { 
      data: { 
        url: shareUrl, 
        text: shareText,
        title: `Post by ${post.profiles?.full_name}`
      }, 
      error: null 
    };
  },
  // SECURE: Use privacy-focused approach for post interactions
  async getPostInteractions(postId: string) {
    // Use the secure function to get aggregated counts without exposing user identities
    const { data, error } = await supabase
      .rpc('get_post_interaction_counts', { post_id_param: postId });
    
    if (error) {
      console.error('Error fetching post interactions:', error);
      return { data: [], error };
    }

    // Convert to the expected format
    const result = data?.[0] || { likes_count: 0, bookmarks_count: 0, reposts_count: 0 };
    
    return { 
      data: {
        likes_count: result.likes_count || 0,
        bookmarks_count: result.bookmarks_count || 0,
        reposts_count: result.reposts_count || 0
      }, 
      error: null 
    };
  },
  async updatePost(postId: string, updates: {
    content?: string;
    image_url?: string;
    document_url?: string;
    document_name?: string;
  }) {
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar,
          profession,
          user_type
        )
      `)
      .single();
    
    return { data, error };
  },
  async deletePost(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    return { data, error };
  }
};
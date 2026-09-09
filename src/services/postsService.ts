import { supabase } from '@/integrations/supabase/client';

export const postsService = {
    async getPosts(category?: string, sortBy: string = "latest") {
    let query = supabase
      .from("posts")
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar,
          profession,
          user_type,
          title
        )
      `);

    if (category && category !== "all" && category !== "latest") {
      const categoryMap: { [key: string]: string } = {
        industry: "industry",
        projects: "project",
        opportunities: "opportunity",
      };

      query = query.eq(
        "location",
        categoryMap[category] || category
      );
    }

    if (sortBy === "latest") {
      query = query.order("created_at", {
        ascending: false,
      });
    } else if (sortBy === "popular") {
      query = query.order("created_at", {
        ascending: false,
      });
    }

    const { data, error } = await query;

    if (error || !data) {
      return { data, error };
    }

    // Fetch REAL interaction counts
    const posts = await Promise.all(
      data.map(async (post) => {
        const { data: counts } =
          await this.getPostInteractions(post.id);

        return {
          ...post,
          likes_count: counts?.likes_count ?? 0,
          reposts_count: counts?.reposts_count ?? 0,
        };
      })
    );

    return {
      data: posts,
      error: null,
    };
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

   const { data: existingLike } = await supabase
      .from("post_interactions")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .eq("type", "like")
      .maybeSingle();

   let action;

   if(existingLike){

      await supabase
      .from("post_interactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId)
      .eq("type","like");

      action="unliked";

   }else{

      await supabase
      .from("post_interactions")
      .insert({
         post_id:postId,
         user_id:userId,
         type:"like"
      });

      action="liked";

   }

   const { data: counts } =
      await this.getPostInteractions(postId);

   return {
      data: counts,
      error:null,
      action: existingLike ? "unliked" : "liked",
      counts
   };
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
    // Use maybeSingle() instead of single() to avoid 406 error when no row exists
    const { data: existingRepost, error: checkError } = await supabase
      .from('reposts')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing repost:', checkError);
      return { data: null, error: checkError, action: 'none' };
    }

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
        .maybeSingle();
      return { data, error, action: 'reposted' };
    }
  },
  async sharePost(postId: string, userId?: string, platform: string = 'internal') {
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

    // Record share in post_shares table if user is logged in
    // Use upsert with onConflict to avoid duplicate share records.
    // Falls back to plain insert if upsert fails (e.g. unique constraint missing).
    if (userId) {
      const { error: shareError } = await supabase
        .from('post_shares')
        .upsert(
          { post_id: postId, user_id: userId, platform },
          { onConflict: 'post_id,user_id' }
        );

      // If upsert fails (e.g. constraint not yet applied), try plain insert
      if (shareError) {
        console.warn('[postsService] Share upsert failed, trying plain insert:', shareError.message);
        await supabase
          .from('post_shares')
          .insert({ post_id: postId, user_id: userId, platform });
      }
    }

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
      return { data: { likes_count: 0, bookmarks_count: 0, reposts_count: 0 }, error };
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
  },
  // Fetch the actual stored counts for a post (comments_count, shares_count, etc.)
  // Used to sync optimistic UI updates with the DB-maintained values.
  async getPostCounts(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      likes_count,
      comments_count,
      reposts_count,
      shares_count
    `)
    .eq("id", postId)
    .single();

  return { data, error };
}
};
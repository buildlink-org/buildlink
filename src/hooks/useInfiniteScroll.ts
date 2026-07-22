import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { optimizedPostsService, PostsQuery } from '@/services/optimizedPostsService';

interface UseInfiniteScrollOptions extends Omit<PostsQuery, 'offset'> {
  enabled?: boolean;
  onError?: (error: any) => void;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions = {}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<any>(null);
  const [postInteractions, setPostInteractions] = useState<{[key: string]: any}>({});
  
  const offsetRef = useRef(0);
  const isLoadingRef = useRef(false);
  
  const { 
    enabled = true, 
    category, 
    sortBy = 'latest', 
    limit = 10,
    onError 
  } = options;

  // Load more posts
  const loadMore = useCallback(async (reset = false) => {
    if (isLoadingRef.current || (!hasMore && !reset)) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    
    if (reset) {
      offsetRef.current = 0;
      setError(null);
    }

    try {
      const { data, error: fetchError, hasMore: moreAvailable, nextOffset } = 
        await optimizedPostsService.getPostsPaginated({
          category,
          sortBy,
          limit,
          offset: offsetRef.current,
          fields: ['preview']
        });

      if (fetchError) {
        setError(fetchError);
        onError?.(fetchError);
        return;
      }

      if (reset) {
        setPosts(data || []);
      } else {
        setPosts(prev => [...prev, ...(data || [])]);
      }
      
      setHasMore(moreAvailable);
      offsetRef.current = nextOffset;

      // Load interactions for new posts
      if (user && data && data.length > 0) {
        const postIds = data.map(post => post.id);
        const { data: interactions } = await optimizedPostsService.getPostInteractionsOptimized(
          postIds, 
          user.id
        );
        
        if (interactions) {
          setPostInteractions(prev => ({ ...prev, ...interactions }));
        }
      }
      
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      isLoadingRef.current = false;
    }
  }, [category, sortBy, limit, user, hasMore, onError]);

  // Initial load
  useEffect(() => {
    if (enabled) {
      loadMore(true);
    }
  }, [enabled, category, sortBy]);

  // Intersection Observer for infinite scroll
  const observerRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || !hasMore) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { 
        rootMargin: '100px', // Trigger 100px before reaching the end
        threshold: 0.1 
      }
    );
    
    if (node) observer.observe(node);
    
    return () => observer.disconnect();
  }, [loading, hasMore, loadMore]);

  // Refresh function
  const refresh = useCallback(() => {
    setPosts([]);
    setPostInteractions({});
    setHasMore(true);
    loadMore(true);
  }, [loadMore]);

  // Update single post interaction
  const updatePostInteraction = useCallback((postId: string, interaction: any) => {
    setPostInteractions(prev => ({
      ...prev,
      [postId]: { ...prev[postId], ...interaction }
    }));
  }, []);

  // Update post counts
 const updatePostCounts = useCallback(
  (
    postId: string,
    counts: Partial<{
      likes_count: number;
      comments_count: number;
      reposts_count: number;
      shares_count: number;
    }>
  ) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        return {
          ...post,
          likes_count:
            counts.likes_count ?? post.likes_count,
          comments_count:
            counts.comments_count ??
            post.comments_count,
          reposts_count:
            counts.reposts_count ??
            post.reposts_count,
          shares_count:
            counts.shares_count ??
            post.shares_count,
        };
      })
    );
  },
  []
);

  return {
    posts,
    loading,
    initialLoading,
    hasMore,
    error,
    postInteractions,
    loadMore,
    refresh,
    observerRef,
    updatePostInteraction,
    updatePostCounts
  };
};
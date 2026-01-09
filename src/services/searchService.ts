import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  accountType?: 'student' | 'professional' | 'company';
  experienceLevel?: 'student' | 'junior' | 'mid-level' | 'senior';
  skills?: string[];
}

export interface SearchResult {
  id: string;
  full_name: string | null;
  title: string | null;
  profession: string | null;
  organization: string | null;
  avatar: string | null;
  user_type: string;
  skills?: string[];
  bio?: string | null;
  connectionStatus?: 'not_connected' | 'pending' | 'connected';
  matchScore?: number; // For priority sorting
}

export const searchService = {
  // Debounce helper
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Enhanced profile search with filters and priority matching
  async searchProfiles(
    query: string,
    filters?: SearchFilters
  ): Promise<{ data: SearchResult[]; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: 'Authentication required' };
    }

    try {
      const { data, error } = await supabase
        .rpc('search_profiles_enhanced', {
          search_term: query.trim(),
          account_type_filter: filters?.accountType || null,
          experience_level_filter: filters?.experienceLevel || null,
          skills_filter: filters?.skills || null,
          current_user_id: user.id,
        });

      // Fallback if function missing or errors
      if (error) {
        console.error('search_profiles_enhanced error:', error);
        const { data: fallbackData, error: fallbackError } = await supabase
          .rpc('search_connected_profiles', { search_term: query.trim() });
        if (fallbackError) {
          throw fallbackError;
        }
        const sortedResults = (fallbackData || []).sort((a, b) => {
          const scoreA = this.calculateMatchScore(query, a);
          const scoreB = this.calculateMatchScore(query, b);
          return scoreB - scoreA;
        });
        return { data: sortedResults, error: null };
      }

      const sortedResults = (data || []).sort((a, b) => {
        const scoreA = this.calculateMatchScore(query, a);
        const scoreB = this.calculateMatchScore(query, b);
        return scoreB - scoreA;
      });
      return { data: sortedResults, error: null };
    } catch (error) {
      console.error('Search error:', error);
      return { data: [], error };
    }
  },

  // Calculate match score for priority sorting
  calculateMatchScore(query: string, profile: SearchResult): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    // Exact name match (highest priority)
    if (profile.full_name?.toLowerCase() === lowerQuery) {
      score += 100;
    }
    // Name starts with query
    else if (profile.full_name?.toLowerCase().startsWith(lowerQuery)) {
      score += 80;
    }
    // Name contains query
    else if (profile.full_name?.toLowerCase().includes(lowerQuery)) {
      score += 60;
    }

    // Profession exact match
    if (profile.profession?.toLowerCase() === lowerQuery) {
      score += 50;
    }
    // Profession contains query
    else if (profile.profession?.toLowerCase().includes(lowerQuery)) {
      score += 30;
    }

    // Skills match
    if (profile.skills) {
      const matchingSkills = profile.skills.filter(skill =>
        skill.toLowerCase().includes(lowerQuery)
      );
      score += matchingSkills.length * 20;
    }

    // Title match
    if (profile.title?.toLowerCase().includes(lowerQuery)) {
      score += 15;
    }

    return score;
  },

  // Search posts (keep existing)
  async searchPosts(query: string) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_author_id_fkey(*),
        likes_count,
        comments_count,
        reposts_count
      `)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false });
    
    return { data, error };
  }
};

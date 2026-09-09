import { supabase } from '@/integrations/supabase/client';

export const skillsService = {
  async getSkillResources(options: { type?: string; category?: string; difficulty?: string } = {}) {
    let query = supabase
      .from('skill_resources')
      .select('*');

    if (options.type && options.type !== 'all' && options.type !== 'latest') {
      const singularType = options.type.endsWith('s') ? options.type.slice(0, -1) : options.type;
      query = query.eq('type', singularType);
    }
    if (options.category) {
      query = query.eq('category', options.category);
    }
    if (options.difficulty) {
      query = query.eq('difficulty_level', options.difficulty);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    return { data, error };
  },

  async getStats() {
    const types = ['course', 'webinar', 'article', 'certification'] as const;

    const results = await Promise.all(
      types.map(async (type) => {
        const { count, error } = await supabase
          .from('skill_resources')
          .select('*', { count: 'exact', head: true })
          .eq('type', type);
        return { type, count, error };
      })
    );

    const firstError = results.find((r) => r.error)?.error;
    if (firstError) {
      return { data: null, error: firstError };
    }

    const toCount = (type: string) =>
      results.find((r) => r.type === type)?.count ?? 0;

    return {
      data: {
        coursesCount: toCount('course'),
        webinarsCount: toCount('webinar'),
        articlesCount: toCount('article'),
        certificationsCount: toCount('certification'),
      },
      error: null,
    };
  },
};

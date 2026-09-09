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
    const [
      { count: coursesCount, error: coursesError },
      { count: webinarsCount, error: webinarsError },
      { count: articlesCount, error: articlesError },
      { count: certificationsCount, error: certsError },
    ] = await Promise.all([
      supabase.from('skill_resources').select('*', { count: 'exact', head: true }).eq('type', 'course'),
      supabase.from('skill_resources').select('*', { count: 'exact', head: true }).eq('type', 'webinar'),
      supabase.from('skill_resources').select('*', { count: 'exact', head: true }).eq('type', 'article'),
      supabase.from('skill_resources').select('*', { count: 'exact', head: true }).eq('type', 'certification'),
    ]);

    const error = coursesError || webinarsError || articlesError || certsError;
    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        coursesCount: coursesCount ?? 0,
        webinarsCount: webinarsCount ?? 0,
        articlesCount: articlesCount ?? 0,
        certificationsCount: certificationsCount ?? 0,
      },
      error: null,
    };
  },
};

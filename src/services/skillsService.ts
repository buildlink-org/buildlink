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
    const { count: coursesCount, error: coursesError } = await supabase
      .from('skill_resources')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'course');
    
    if (coursesError) {
      return { data: null, error: coursesError };
    }

    return { data: { coursesCount }, error: null };
  },
};

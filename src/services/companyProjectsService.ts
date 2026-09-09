import { supabase } from '@/integrations/supabase/client';

export const companyProjectsService = {
  async getProjects(companyId: string) {
    const { data, error } = await supabase
      .from('company_projects')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getAllProjects() {
    const { data, error } = await supabase
      .from('company_projects')
      .select('*, profiles:company_id(full_name, avatar, organization)');
    return { data, error };
  },

  async createProject(project: {
    company_id: string; title: string; description?: string;
    category?: string; status?: string; location?: string;
    image_url?: string; budget?: number;
  }) {
    const { data, error } = await supabase.from('company_projects').insert(project).select().single();
    return { data, error };
  },

  async updateProject(id: string, updates: any) {
    const { data, error } = await supabase.from('company_projects').update(updates).eq('id', id).select().single();
    return { data, error };
  },

  async deleteProject(id: string) {
    const { error } = await supabase.from('company_projects').delete().eq('id', id);
    return { error };
  },

  async getProjectCount(companyId: string) {
    const { count, error } = await supabase
      .from('company_projects').select('*', { count: 'exact', head: true }).eq('company_id', companyId);
    return { count: count ?? 0, error };
  },
};
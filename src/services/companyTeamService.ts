import { supabase } from '@/integrations/supabase/client';

export const companyTeamService = {
  async getMembers(companyId: string) {
    const { data, error } = await supabase
      .from('company_team_members').select('*, profiles:user_id(full_name, avatar, profession)')
      .eq('company_id', companyId);
    return { data, error };
  },

  async inviteMember(companyId: string, userId: string, role: string = 'member') {
    const { data, error } = await supabase.from('company_team_members').insert({
      company_id: companyId, user_id: userId, role, status: 'invited',
    }).select().single();
    return { data, error };
  },

  async updateMemberRole(id: string, role: string) {
    const { data, error } = await supabase.from('company_team_members').update({ role }).eq('id', id).select().single();
    return { data, error };
  },

  async removeMember(id: string) {
    const { error } = await supabase.from('company_team_members').delete().eq('id', id);
    return { error };
  },

  async getMemberCount(companyId: string) {
    const { count, error } = await supabase
      .from('company_team_members').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).eq('status', 'active');
    return { count: count ?? 0, error };
  },
};
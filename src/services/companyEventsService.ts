import { supabase } from '@/integrations/supabase/client';

export const companyEventsService = {
  async getEvents(companyId?: string) {
    let query = supabase.from('company_events').select('*, profiles:company_id(full_name, avatar, organization)');
    if (companyId) query = query.eq('company_id', companyId);
    const { data, error } = await query.order('start_date', { ascending: true });
    return { data, error };
  },

  async createEvent(event: {
    company_id: string; title: string; description?: string;
    event_type?: string; location?: string;
    start_date?: string; end_date?: string; registration_deadline?: string;
    max_participants?: number;
  }) {
    const { data, error } = await supabase.from('company_events').insert(event).select().single();
    return { data, error };
  },

  async updateEvent(id: string, updates: any) {
    const { data, error } = await supabase.from('company_events').update(updates).eq('id', id).select().single();
    return { data, error };
  },

  async deleteEvent(id: string) {
    const { error } = await supabase.from('company_events').delete().eq('id', id);
    return { error };
  },

  async getEventCount(companyId: string) {
    const { count, error } = await supabase
      .from('company_events').select('*', { count: 'exact', head: true }).eq('company_id', companyId);
    return { count: count ?? 0, error };
  },

  async register(eventId: string, userId: string) {
    const { data, error } = await supabase.from('event_registrations').insert({
      event_id: eventId, user_id: userId,
    }).select().single();
    return { data, error };
  },

  async getRegistrations(eventId: string) {
    const { data, error } = await supabase
      .from('event_registrations').select('*, profiles:user_id(full_name, avatar)').eq('event_id', eventId);
    return { data, error };
  },
};
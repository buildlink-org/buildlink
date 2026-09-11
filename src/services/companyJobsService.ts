import { supabase } from '@/integrations/supabase/client';

export const companyJobsService = {
  async getJobs(companyId?: string) {
    let query = supabase.from('company_jobs').select('*, profiles:company_id(full_name, avatar, organization)');
    if (companyId) query = query.eq('company_id', companyId);
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createJob(job: {
    company_id: string; title: string; description?: string;
    location?: string; type?: string; salary_range?: string;
  }) {
    const { data, error } = await supabase.from('company_jobs').insert(job).select().single();
    return { data, error };
  },

  async updateJob(id: string, updates: any) {
    const { data, error } = await supabase.from('company_jobs').update(updates).eq('id', id).select().single();
    return { data, error };
  },

  async deleteJob(id: string) {
    const { error } = await supabase.from('company_jobs').delete().eq('id', id);
    return { error };
  },

  async getJobCount(companyId: string) {
    const { count, error } = await supabase
      .from('company_jobs').select('*', { count: 'exact', head: true }).eq('company_id', companyId);
    return { count: count ?? 0, error };
  },

  async apply(jobId: string, applicantId: string, coverLetter?: string) {
    const { data, error } = await supabase.from('job_applications').insert({
      job_id: jobId, applicant_id: applicantId, cover_letter: coverLetter,
    }).select().single();
    return { data, error };
  },

  async getApplications(jobId: string) {
    const { data, error } = await supabase
      .from('job_applications').select('*, profiles:applicant_id(full_name, avatar)').eq('job_id', jobId);
    return { data, error };
  },
};
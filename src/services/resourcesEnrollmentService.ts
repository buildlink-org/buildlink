import { supabase } from '@/integrations/supabase/client';

export interface Enrollment {
  id: string;
  user_id: string;
  resource_id: string;
  progress: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const resourcesEnrollmentService = {
  /**
   * Enroll the current user in a skill resource.
   * Uses upsert to handle the unique constraint gracefully.
   */
  async enroll(resourceId: string): Promise<{ data: Enrollment | null; error: any }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const { data, error } = await supabase
      .from('resource_enrollments')
      .insert({ user_id: user.user.id, resource_id: resourceId, progress: 0 })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Unenroll (remove enrollment) from a resource.
   */
  async unenroll(resourceId: string): Promise<{ error: any }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { error: { message: 'Not authenticated' } };
    }

    const { error } = await supabase
      .from('resource_enrollments')
      .delete()
      .eq('user_id', user.user.id)
      .eq('resource_id', resourceId);

    return { error };
  },

  /**
   * Get all enrollments for the current user.
   */
  async getMyEnrollments(): Promise<{ data: Enrollment[] | null; error: any }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const { data, error } = await supabase
      .from('resource_enrollments')
      .select('*')
      .eq('user_id', user.user.id);

    return { data, error };
  },

  /**
   * Get all resource IDs the current user is enrolled in (for quick lookup).
   */
  async getEnrolledResourceIds(): Promise<string[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return [];

    const { data } = await supabase
      .from('resource_enrollments')
      .select('resource_id')
      .eq('user_id', user.user.id);

    return data?.map((e) => e.resource_id) ?? [];
  },

  /**
   * Update enrollment progress (0-100).
   */
  async updateProgress(resourceId: string, progress: number): Promise<{ data: Enrollment | null; error: any }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const updateData: any = { progress };
    if (progress >= 100) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('resource_enrollments')
      .update(updateData)
      .eq('user_id', user.user.id)
      .eq('resource_id', resourceId)
      .select()
      .single();

    return { data, error };
  },
};
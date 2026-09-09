import { supabase } from '@/integrations/supabase/client';
import type { PostDraft, PostCategory } from '@/types/posts';

export const draftsService = {
  /**
   * Get all drafts for the current user, newest first.
   */
  async getMyDrafts(): Promise<{ data: PostDraft[] | null; error: any }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return { data: null, error: { message: 'Not authenticated' } };

    const { data, error } = await supabase
      .from('post_drafts')
      .select('*')
      .eq('user_id', user.user.id)
      .order('updated_at', { ascending: false });

    return { data, error };
  },

  /**
   * Save a new draft or update an existing one.
   */
  async saveDraft(draft: {
    id?: string;
    content: string;
    category: PostCategory;
    image_url?: string | null;
    document_url?: string | null;
    document_name?: string | null;
    location_lat?: number | null;
    location_lng?: number | null;
    location_name?: string | null;
  }): Promise<{ data: PostDraft | null; error: any }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return { data: null, error: { message: 'Not authenticated' } };

    const payload = {
      user_id: user.user.id,
      content: draft.content,
      category: draft.category,
      image_url: draft.image_url ?? null,
      document_url: draft.document_url ?? null,
      document_name: draft.document_name ?? null,
      location_lat: draft.location_lat ?? null,
      location_lng: draft.location_lng ?? null,
      location_name: draft.location_name ?? null,
    };

    if (draft.id) {
      // Update existing draft
      const { data, error } = await supabase
        .from('post_drafts')
        .update(payload)
        .eq('id', draft.id)
        .eq('user_id', user.user.id)
        .select()
        .single();

      return { data, error };
    }

    // Create new draft
    const { data, error } = await supabase
      .from('post_drafts')
      .insert(payload)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Delete a draft by ID (must own it).
   */
  async deleteDraft(draftId: string): Promise<{ error: any }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return { error: { message: 'Not authenticated' } };

    const { error } = await supabase
      .from('post_drafts')
      .delete()
      .eq('id', draftId)
      .eq('user_id', user.user.id);

    return { error };
  },

  /**
   * Publish a draft: create a real post, then delete the draft.
   */
  async publishDraft(
    draftId: string,
    extraFields?: { image_url?: string; document_url?: string; document_name?: string }
  ): Promise<{ data: any; error: any }> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return { data: null, error: { message: 'Not authenticated' } };

    // Fetch the draft
    const { data: draft, error: fetchError } = await supabase
      .from('post_drafts')
      .select('*')
      .eq('id', draftId)
      .eq('user_id', user.user.id)
      .single();

    if (fetchError || !draft) return { data: null, error: fetchError || { message: 'Draft not found' } };

    // Create the post
    const { data: post, error: createError } = await supabase
      .from('posts')
      .insert({
        author_id: user.user.id,
        content: draft.content,
        category: draft.category,
        image_url: extraFields?.image_url || draft.image_url,
        document_url: extraFields?.document_url || draft.document_url,
        document_name: extraFields?.document_name || draft.document_name,
        likes_count: 0,
        comments_count: 0,
        reposts_count: 0,
      })
      .select()
      .single();

    if (createError) return { data: null, error: createError };

    // Delete the draft
    await supabase.from('post_drafts').delete().eq('id', draftId);

    return { data: post, error: null };
  },
};
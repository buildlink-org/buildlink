import { supabase } from '@/integrations/supabase/client';

export const secureProfileService = {
  // Get public profile information (requires authentication)
  async getPublicProfile(userId: string) {
    if (!userId) {
      return { data: null, error: 'User ID is required' };
    }

    try {
      const { data, error } = await supabase
        .rpc('get_public_profile_info', { user_id_param: userId });
      
      if (error) {
        console.error('Error fetching public profile:', error);
        return { data: null, error };
      }

      const profile = Array.isArray(data) ? data[0] : null;

      return { data: profile || null, error: null };
    } catch (err) {
      console.error('Exception in getPublicProfile:', err);
      return { data: null, error: err };
    }
  },

  // Get connected user profile information (more detailed)
  async getConnectedProfile(userId: string) {
    if (!userId) {
      return { data: null, error: 'User ID is required' };
    }

    try {
      const { data, error } = await supabase
        .rpc('get_connected_profile_info', { user_id_param: userId });
      
      if (error) {
        console.error('Error fetching connected profile:', error);
        return { data: null, error };
      }

      return { data: data?.[0] || null, error: null };
    } catch (err) {
      console.error('Exception in getConnectedProfile:', err);
      return { data: null, error: err };
    }
  },

  // Get user's own complete profile
  async getOwnProfile(userId: string) {
    if (!userId) {
      return { data: null, error: 'User ID is required' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching own profile:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in getOwnProfile:', err);
      return { data: null, error: err };
    }
  },

  // Get user's privacy settings
  async getPrivacySettings(userId: string) {
    if (!userId) {
      return { data: null, error: 'User ID is required' };
    }

    try {
      const { data, error } = await supabase
        .from('profile_privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching privacy settings:', error);
        return { data: null, error };
      }

      // Return default settings if none found
      const defaultSettings = {
        user_id: userId,
        show_email: false,
        show_phone: false,
        show_experience: true,
        show_education: true,
        show_skills: true,
        show_social_links: true
      };

      return { data: data || defaultSettings, error: null };
    } catch (err) {
      console.error('Exception in getPrivacySettings:', err);
      return { data: null, error: err };
    }
  },

  // Update privacy settings
  async updatePrivacySettings(userId: string, settings: {
    show_email?: boolean;
    show_phone?: boolean;
    show_experience?: boolean;
    show_education?: boolean;
    show_skills?: boolean;
    show_social_links?: boolean;
  }) {
    if (!userId) {
      return { data: null, error: 'User ID is required' };
    }

    try {
      const { data, error } = await supabase
        .from('profile_privacy_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error updating privacy settings:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception in updatePrivacySettings:', err);
      return { data: null, error: err };
    }
  },

  // Check if profiles are connected
  async areProfilesConnected(userId1: string, userId2: string) {
    if (!userId1 || !userId2) {
      return { connected: false, error: 'Both user IDs are required' };
    }

    try {
      const { data, error } = await supabase
        .from('connections')
        .select('id')
        .eq('status', 'accepted')
        .or(`and(user_id.eq.${userId1},connected_user_id.eq.${userId2}),and(user_id.eq.${userId2},connected_user_id.eq.${userId1})`)
        .limit(1);
      
      if (error) {
        console.error('Error checking connection:', error);
        return { connected: false, error };
      }

      return { connected: (data && data.length > 0), error: null };
    } catch (err) {
      console.error('Exception in areProfilesConnected:', err);
      return { connected: false, error: err };
    }
  },

  // Get appropriate profile based on relationship
  async getProfileByRelationship(targetUserId: string, currentUserId?: string) {
    if (!targetUserId) {
      return { data: null, error: 'Target user ID is required' };
    }

    // If it's the user's own profile
    if (currentUserId && targetUserId === currentUserId) {
      return this.getOwnProfile(targetUserId);
    }

    if (!currentUserId) {
      return { data: null, error: 'Authentication required to view profiles' };
    }

    // Check if users are connected
    const { connected } = await this.areProfilesConnected(currentUserId, targetUserId);
    
    if (connected) {
      // Get more detailed profile for connected users
      return this.getConnectedProfile(targetUserId);
    } else {
      // Get basic public profile
      return this.getPublicProfile(targetUserId);
    }
  }
};
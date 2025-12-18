
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
}


export const directMessagesService = {
  async sendMessage({ sender_id, recipient_id, content, image_url }: {
    sender_id: string;
    recipient_id: string;
    content?: string;
    image_url?: string;
  }) {
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id,
        recipient_id,
        content,
        image_url,
      })
      .select()
      .single();
    return { data, error };
  },
  async getConversations(userId: string) {
    // Return list of unique users the current user has chatted with (MVP)
    const { data, error } = await supabase.rpc('get_conversations_for_user', { input_user_id: userId });
    return { data, error };
  },
  async getMessages(userId: string, otherUserId: string) {
    // Get all messages between two users, sorted by created_at ascending
    const { data, error } = await supabase
      .from('direct_messages')
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });
    return { data, error };
  },
   async markMessagesAsRead (userId: string, otherUserId: string) {
    // This updates messages where the current user is the recipient AND the other user is the sender
    const { error } = await supabase
      .from('direct_messages')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('sender_id', otherUserId)
      .eq('read', false);

    if (error) console.error('Error marking messages as read:', error);
    return { error };
  },

  async getTotalUnreadCount (userId: string) {
    const { count, error } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact' })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return { data: null, error };
    }
    return { data: count, error: null };
  },
};

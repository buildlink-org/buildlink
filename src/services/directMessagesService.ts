
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
  }
};

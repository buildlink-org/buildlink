
import { supabase } from "@/integrations/supabase/client";

export const connectionsService = {
  async connect(userId: string, targetId: string) {
    return await supabase
      .from("connections")
      .insert({ user_id: userId, connected_user_id: targetId, status: "pending",  })
      .select()
      .single();
  },
  async acceptRequest(connId: string) {
    return await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connId)
      .select()
      .single();
  },
  async getConnections(userId: string) {
    return await supabase
      .from("connections")
      .select("*")
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`);
  },
  async getConnectionStatus(userId: string, targetId: string) {
    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .or(
        `and(user_id.eq.${userId},connected_user_id.eq.${targetId}),and(user_id.eq.${targetId},connected_user_id.eq.${userId})`
      )
      .maybeSingle();
    return { data, error };
  }
};

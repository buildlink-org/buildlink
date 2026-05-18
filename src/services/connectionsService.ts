import { supabase } from "@/integrations/supabase/client";

export const connectionsService = {

  // FOLLOW / CONNECT
  async connect(
    userId: string,
    targetId: string,
    isCompany: boolean = false
  ) {

    // CHECK EXISTING CONNECTION
    const { data: existingConnection } = await supabase
      .from("connections")
      .select("*")
      .or(
        `and(user_id.eq.${userId},connected_user_id.eq.${targetId}),and(user_id.eq.${targetId},connected_user_id.eq.${userId})`
      )
      .maybeSingle();

    // =====================================
    // COMPANY FOLLOW FIX
    // =====================================
    // If a pending connection already exists
    // for a company, convert it to accepted
    if (existingConnection && isCompany) {

      // Already following
      if (existingConnection.status === "accepted") {
        return {
          data: existingConnection,
          error: null,
        };
      }

      // Convert pending -> accepted
      const { data, error } = await supabase
        .from("connections")
        .update({
          status: "accepted",
        })
        .eq("id", existingConnection.id)
        .select()
        .single();

      return { data, error };
    }

    // =====================================
    // NORMAL USER DUPLICATE PROTECTION
    // =====================================
    if (existingConnection) {
      return {
        data: existingConnection,
        error: null,
      };
    }

    // =====================================
    // CREATE NEW CONNECTION
    // =====================================
    const status = isCompany
      ? "accepted"
      : "pending";

    return await supabase
      .from("connections")
      .insert({
        user_id: userId,
        connected_user_id: targetId,
        status,
      })
      .select()
      .single();
  },

  // ACCEPT REQUEST
  async acceptRequest(connId: string) {
    return await supabase
      .from("connections")
      .update({
        status: "accepted",
      })
      .eq("id", connId)
      .select()
      .single();
  },

  // GET USER CONNECTIONS
  async getConnections(userId: string) {
    return await supabase
      .from("connections")
      .select("*")
      .or(
        `user_id.eq.${userId},connected_user_id.eq.${userId}`
      );
  },

  // GET CONNECTION STATUS
  async getConnectionStatus(
    userId: string,
    targetId: string
  ) {
    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .or(
        `and(user_id.eq.${userId},connected_user_id.eq.${targetId}),and(user_id.eq.${targetId},connected_user_id.eq.${userId})`
      )
      .maybeSingle();

    return { data, error };
  },

  // REMOVE CONNECTION / UNFOLLOW
  async removeConnection(connectionId: string) {

    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId);

    return { error };
  },
};
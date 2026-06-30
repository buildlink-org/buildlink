import { supabase } from "@/integrations/supabase/client";

export const connectionsService = {

  // FOLLOW / CONNECT
 // FOLLOW / CONNECT
async connect(
  userId: string,
  targetId: string,
  isCompany: boolean = false
) {
  // Check existing connection
  const { data: existingConnection } = await supabase
    .from("connections")
    .select("*")
    .or(
      `and(user_id.eq.${userId},connected_user_id.eq.${targetId}),and(user_id.eq.${targetId},connected_user_id.eq.${userId})`
    )
    .maybeSingle();

  // Already exists
  if (existingConnection) {
    // COMPANY FOLLOW
    if (isCompany) {
      if (existingConnection.status !== "accepted") {
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

      return {
        data: existingConnection,
        error: null,
      };
    }

    // USER CONNECTION
    return {
      data: existingConnection,
      error: null,
    };
  }

  // Create new row
  const { data, error } = await supabase
    .from("connections")
    .insert({
      user_id: userId,
      connected_user_id: targetId,
      status: isCompany ? "accepted" : "pending",
    })
    .select()
    .single();

  return { data, error };
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
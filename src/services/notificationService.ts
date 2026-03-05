import { supabase } from "@/integrations/supabase/client"

/**
 * --- comments trigger ---
 * table - notifications
 * function - create notification -> creates new notification on notification table
 * function - get_notification_user -> from notification
 * trigger - trigger_create_comment_notification -> triggeres create notification
 */

export interface Notification {
	id: string
	sender_id: string
	recipient_id: string
	content: string
	created_at: string
	read: boolean
}
 // follows, comments, likes
export const NotificationService = {
	async getNotification(userId: string) {
		const { data, error } = await supabase.rpc("get_notification_for_user", { input_user_id: userId })
		return { data, error }
	},

	async createNotification(notification: { user_id: string; type: string; content: string; from_user_id?: string; link?: string }) {
		const { data, error } = await supabase.rpc("notifications")

		return { data, error }
	},

	async fetchPosts() {
		const { data, error } = await supabase.from("posts").select(`
      *,
      profiles:author_id (
        id,
        full_name,
        avatar,
        profession,
        user_type,
        title
      ),
      likes_count,
      comments_count,
      reposts_count
    `)

		if (error) {
			console.error("Error fetching posts:", error)
		} else {
			console.log("Posts fetched:", data)
		}
	},

	async markAsRead(notificationId: string) {
		const { data, error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

		return { data, error }
	},

	async markAllAsRead(userId: string) {
		const { data, error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false)

		return { data, error }
	},
}

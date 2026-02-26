import { supabase } from "@/integrations/supabase/client"
import { useNotificationsStore } from "@/stores/notificationStore"
import { Notification } from "@/types"
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js"

export const notificationsService = {
	async getNotifications(userId: string) {
		const { data, error } = await supabase
			.from("notifications")
			.select(
				`
        *,
        from_user:profiles!notifications_from_user_id_fkey(full_name, avatar)
      `,
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false })

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
	
	async createNotification(notification: { user_id: string; type: string; content: string; from_user_id?: string; link?: string }) {
		const { data, error } = await supabase.from("notifications").insert(notification).select().single()

		return { data, error }
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

export const initNotificationsListener = (userId: string) => {
	const addNotification = useNotificationsStore.getState().addNotification

	const channel = supabase
		.channel(`public:notifications_user_${userId}`)
		.on(
			"postgres_changes",
			{
				event: "INSERT",
				schema: "public",
				table: "notifications",
				filter: `user_id=eq.${userId}`,
			},
			(payload: RealtimePostgresInsertPayload<any>) => {
				// Map payload to Notification type
				const newNotification: Notification = {
					id: payload.new.id,
					content: payload.new.content,
					type: payload.new.type,
					read: payload.new.read,
					created_at: payload.new.created_at,
					from_user: payload.new.from_user,
				}
				console.log("Mapped notification:", newNotification)
				addNotification(newNotification)
			},
		)
		.subscribe()

	const commentChannel = supabase
		.channel(`comments_user_${userId}`)
		.on(
			"postgres_changes",
			{
				event: "INSERT",
				schema: "public",
				table: "comments",
				filter: `post_author_id=eq.${userId}`, // only comments on your posts
			},
			(payload) => {
				console.log("New comment alert!", payload)

				// Optionally: trigger a notification in your store
				useNotificationsStore.getState().addNotification({
					id: payload.new.id,
					content: `New comment: ${payload.new.content}`,
					type: "comments",
					read: false,
					created_at: payload.new.created_at,
					from_user: payload.new.from_user,
				})
			},
		)
		.subscribe()
	// Return cleanup function
	return () => {
		supabase.removeChannel(channel)
		supabase.removeChannel(commentChannel)
	}
}

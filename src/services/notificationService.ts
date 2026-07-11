import { supabase } from "@/integrations/supabase/client"

export interface Notification {
	id: string
	type: string
	category: string
	priority: string
	content: string
	read: boolean
	created_at: string
	post_id?: string
	from_user?: {
		id?: string
		full_name: string
		avatar: string
	}
}

export const NotificationService = {
	async getNotification(userId: string) {
		const { data, error } = await supabase.rpc("get_notification_for_user", { input_user_id: userId })
		return { data, error }
	},

	async getNotificationsPaginated(userId: string, limit: number = 20, offset: number = 0) {
		const { data, error } = await supabase
			.from("notifications")
			.select("*, from_user:from_user_id(id, full_name, avatar)")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1)
		return { data, error }
	},

	async createNotification(params: {
		user_id: string
		type: string
		content: string
		from_user_id?: string
		link?: string
	}) {
		const { data, error } = await supabase.rpc("create_notification", {
			p_user_id: params.user_id,
			p_type: params.type,
			p_content: params.content,
			p_from_user_id: params.from_user_id ?? null,
			p_link: params.link ?? null,
		})
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

export interface GroupedNotification extends Notification {
	groupCount?: number
	groupUsers?: { full_name: string; avatar: string }[]
}

const GROUP_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export function groupNotifications(notifications: Notification[]): GroupedNotification[] {
	const groups = new Map<string, Notification[]>()
	const singles: Notification[] = []

	for (const n of notifications) {
		// Only group like/comment/follow type notifications with a post_id
		if (n.post_id && (n.type === "like" || n.type === "comment" || n.type === "follow")) {
			const key = `${n.type}:${n.post_id}`
			if (!groups.has(key)) {
				groups.set(key, [])
			}
			groups.get(key)!.push(n)
		} else {
			singles.push(n)
		}
	}

	const grouped: GroupedNotification[] = []

	for (const [, items] of groups) {
		if (items.length === 1) {
			singles.push(items[0])
			continue
		}

		// Sort by created_at descending, take the most recent as representative
		items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

		// Check if all items are within the time window
		const latest = new Date(items[0].created_at).getTime()
		const earliest = new Date(items[items.length - 1].created_at).getTime()
		if (latest - earliest > GROUP_WINDOW_MS) {
			// Items span too much time — keep them separate
			singles.push(...items)
			continue
		}

		const representative = { ...items[0] }
		const users = items.map((n) => n.from_user).filter(Boolean) as { full_name: string; avatar: string }[]
		const uniqueUsers = users.filter((u, i, arr) => arr.findIndex((x) => x.full_name === u.full_name) === i)

		const typeLabel =
			representative.type === "like" ? "liked" :
			representative.type === "comment" ? "commented on" :
			representative.type === "follow" ? "followed" : representative.type

		if (uniqueUsers.length === 1) {
			representative.content = `${uniqueUsers[0].full_name} ${typeLabel} your post`
		} else if (uniqueUsers.length <= 3) {
			const names = uniqueUsers.map((u) => u.full_name).join(", ")
			representative.content = `${names} ${typeLabel} your post`
		} else {
			representative.content = `${uniqueUsers[0].full_name} and ${uniqueUsers.length - 1} others ${typeLabel} your post`
		}

		representative.groupCount = items.length
		;(representative as GroupedNotification).groupUsers = uniqueUsers
		grouped.push(representative as GroupedNotification)
	}

	// Sort singles by created_at descending
	singles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

	return [...grouped, ...singles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

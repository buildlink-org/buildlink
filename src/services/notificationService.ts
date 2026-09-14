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
	link?: string | null
}

export const NotificationService = {
	async getNotification(userId: string) {
		const { data: rpcData, error: rpcError } = await supabase.rpc(
			"get_notification_for_user",
			{ input_user_id: userId }
		)

		if (!rpcError && rpcData) {
			return { data: rpcData, error: null }
		}

		const { data, error } = await supabase
			.from("notifications")
			.select("*, from_user:from_user_id(id, full_name, avatar)")
			.eq("user_id", userId)
			.order("created_at", { ascending: false })
			.limit(50)

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
	}): Promise<{ data: string | null; error: any }> {
		const { data, error } = await supabase.rpc("create_notification", {
			p_user_id: params.user_id,
			p_type: params.type,
			p_content: params.content,
			p_from_user_id: params.from_user_id ?? null,
			p_link: params.link ?? null,
		})

		if (error) {
			console.warn("[NotificationService] create_notification RPC failed:", error.message)
		}

		return { data, error }
	},

	async markAsRead(notificationId: string) {
		const { data, error } = await supabase
			.from("notifications")
			.update({ read: true })
			.eq("id", notificationId)
		return { data, error }
	},

	async markAllAsRead(userId: string) {
		const { data, error } = await supabase
			.from("notifications")
			.update({ read: true })
			.eq("user_id", userId)
			.eq("read", false)
		return { data, error }
	},

	async hydrateNotification(rawNotification: any): Promise<Notification> {
		const notification: Notification = {
			...rawNotification,
			category: getNotificationCategory(rawNotification),
			read: rawNotification.read ?? false,
		}

		const senderId = rawNotification.from_user_id || rawNotification.from_user?.id
		if (senderId && (!notification.from_user || !notification.from_user.full_name)) {
			try {
				const { data: profile } = await supabase
					.from("profiles")
					.select("id, full_name, avatar")
					.eq("id", senderId)
					.single()

				if (profile) {
					notification.from_user = {
						id: profile.id,
						full_name: profile.full_name || "User",
						avatar: profile.avatar || "",
					}
				}
			} catch (err) {
				console.warn("[NotificationService] Failed to hydrate sender profile:", err)
			}
		}

		return notification
	},

	async requestBrowserPushPermission(): Promise<NotificationPermission | "unsupported"> {
		if (typeof window === "undefined" || !("Notification" in window)) {
			return "unsupported"
		}
		return await window.Notification.requestPermission()
	},

	sendBrowserPushNotification(title: string, options?: NotificationOptions) {
		if (
			typeof window !== "undefined" &&
			"Notification" in window &&
			window.Notification.permission === "granted"
		) {
			try {
				new window.Notification(title, {
					icon: "/favicon.ico",
					...options,
				})
			} catch (e) {
				console.warn("[NotificationService] Browser Notification error:", e)
			}
		}
	},
}

export function getNotificationCategory(notification: { category?: string | null; type?: string | null }): string {
	if (notification.category && notification.category !== "general") {
		return notification.category.toLowerCase()
	}

	const type = (notification.type || "").toLowerCase()

	switch (type) {
		case "like":
		case "comment":
		case "mention":
		case "post":
		case "share":
			return "posts"
		case "follow":
		case "connection":
		case "connection_request":
			return "connections"
		case "job":
		case "application":
			return "jobs"
		case "mentorship":
		case "mentor_request":
			return "mentorship"
		case "training":
		case "course":
			return "training"
		case "message":
			return "messages"
		case "system":
		case "security":
			return "system"
		default:
			return "general"
	}
}

export interface GroupedNotification extends Notification {
	groupCount?: number
	groupUsers?: { full_name: string; avatar: string }[]
}

const GROUP_WINDOW_MS = 60 * 60 * 1000

export function groupNotifications(notifications: Notification[]): GroupedNotification[] {
	const groups = new Map<string, Notification[]>()
	const singles: Notification[] = []

	for (const n of notifications) {
		const normalized: Notification = {
			...n,
			category: getNotificationCategory(n),
		}

		if (normalized.post_id && (normalized.type === "like" || normalized.type === "comment" || normalized.type === "follow")) {
			const key = `${normalized.type}:${normalized.post_id}`
			if (!groups.has(key)) {
				groups.set(key, [])
			}
			groups.get(key)!.push(normalized)
		} else {
			singles.push(normalized)
		}
	}

	const grouped: GroupedNotification[] = []

	for (const [, items] of groups) {
		if (items.length === 1) {
			singles.push(items[0])
			continue
		}

		items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

		const latest = new Date(items[0].created_at).getTime()
		const earliest = new Date(items[items.length - 1].created_at).getTime()
		if (latest - earliest > GROUP_WINDOW_MS) {
			singles.push(...items)
			continue
		}

		const representative: GroupedNotification = { ...items[0] }
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
		representative.groupUsers = uniqueUsers
		grouped.push(representative)
	}

	singles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

	return [...grouped, ...singles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
import { supabase } from "@/integrations/supabase/client"

export interface Message {
	id: string
	sender_id: string
	recipient_id: string
	content: string
	created_at: string
	read: boolean
	image_url?: string | null
	image_type?: "image" | "pdf" | null
	status?: "sending" | "sent" | "failed"
	localPreview?: string | null
}

export const directMessagesService = {
	// SEND
	async sendMessage({
		sender_id,
		recipient_id,
		content,
		image_url,
		image_type,
	}: {
		sender_id: string
		recipient_id: string
		content?: string
		image_url?: string
		image_type?: "image" | "pdf" | null
	}) {
		const { data, error } = await supabase
			.from("direct_messages")
			.insert({
				sender_id,
				recipient_id,
				content,
				image_url,
				image_type,
			})
			.select()
			.single()

		return { data, error }
	},

	// GET CONVERSATIONS
	async getConversations(userId: string) {
		const { data, error } = await supabase.rpc(
			"get_conversations_for_user",
			{ input_user_id: userId }
		)
		return { data, error }
	},

	// GET MESSAGES
	async getMessages(userId: string, otherUserId: string) {
		const { data, error } = await supabase
			.from("direct_messages")
			.select("*")
			.or(
				`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
			)
			.order("created_at", { ascending: true })

		return { data, error }
	},

	// GET OLDER MESSAGES (pagination)
	async getOlderMessages(
		userId: string,
		otherUserId: string,
		before: string,
		pageSize: number = 20
	) {
		const { data, error } = await supabase
			.from("direct_messages")
			.select("*")
			.or(
				`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
			)
			.lt("created_at", before)
			.order("created_at", { ascending: false })
			.limit(pageSize)

		return { data, error }
	},

	// ✅ DELETE MESSAGE
	async deleteMessage(messageId: string) {
		const { error } = await supabase
			.from("direct_messages")
			.delete()
			.eq("id", messageId)

		return { error }
	},

	// ✅ UPDATE MESSAGE
	async updateMessage({
		id,
		content,
	}: {
		id: string
		content: string
	}) {
		const { data, error } = await supabase
			.from("direct_messages")
			.update({ content })
			.eq("id", id)
			.select()
			.single()

		return { data, error }
	},

	// ✅ MARK MESSAGES AS READ
	async markMessagesAsRead(
		currentUserId: string,
		otherUserId: string
	) {
		const { error } = await supabase
			.from("direct_messages")
			.update({ read: true })
			.eq("sender_id", otherUserId)
			.eq("recipient_id", currentUserId)
			.eq("read", false)

		return { error }
	},

	// GET LAST MESSAGE PER CONVERSATION (single query, no N+1)
	async getLastMessagesForUser(userId: string) {
		const { data, error } = await supabase
			.from("direct_messages")
			.select("*")
			.or(
				`sender_id.eq.${userId},recipient_id.eq.${userId}`
			)
			.order("created_at", { ascending: false })
			.limit(200)

		if (error) return { data: null, error }

		// Group by the other user, keep only the latest message per conversation
		const lastMessages: Record<string, Message> = {}
		for (const msg of data) {
			const otherId =
				msg.sender_id === userId
					? msg.recipient_id
					: msg.sender_id
			if (!lastMessages[otherId]) {
				lastMessages[otherId] = msg
			}
		}

		return { data: lastMessages, error: null }
	},
}
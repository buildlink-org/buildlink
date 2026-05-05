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
}
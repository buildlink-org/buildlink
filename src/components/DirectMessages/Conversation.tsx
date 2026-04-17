import React, { useEffect, useRef, useState } from "react"
import { directMessagesService } from "@/services/directMessagesService"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"

interface ConversationProps {
	otherUserId: string
	otherUserName?: string
	onBack: () => void
}

const Conversation: React.FC<ConversationProps> = ({ otherUserId, otherUserName, onBack }) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [messages, setMessages] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [content, setContent] = useState("")
	const bottomRef = useRef<HTMLDivElement>(null)

	//Capitalize name (fix for "frankais" etc.)
	const formattedName =
		otherUserName?.charAt(0).toUpperCase() + otherUserName?.slice(1) || "Conversation"

	useEffect(() => {
		if (!user) return
		const fetchMessages = async () => {
			setLoading(true)
			const { data, error } = await directMessagesService.getMessages(user.id, otherUserId)

			if (error) {
				toast({
					title: "Failed to load messages",
					description: error.message,
					variant: "destructive",
				})
			} else {
				setMessages(data || [])
			}
			setLoading(false)
		}

		fetchMessages()
	}, [user, otherUserId])

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages.length])

	const handleSend = async () => {
		if (!user || !content.trim()) return

		const { data, error } = await directMessagesService.sendMessage({
			sender_id: user.id,
			recipient_id: otherUserId,
			content,
		})

		if (error) {
			toast({
				title: "Failed to send message",
				description: error.message,
				variant: "destructive",
			})
			return
		}

		setMessages((msgs) => [...msgs, data])
		setContent("")
	}

	return (
		<div className="relative mx-auto flex h-[60vh] max-w-2xl flex-col rounded-xl border bg-white shadow">
			{/* Header */}
			<div className="flex justify-between items-center border-b p-3">
				<Button variant="ghost" onClick={onBack}>
					Back
				</Button>
				<div className="font-bold text-center flex-1">{formattedName}</div>
				<div className="w-[60px]" /> {/* spacer for balance */}
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4">
				{loading ? (
					<div className="text-center text-gray-500">Loading...</div>
				) : (
					<div className="space-y-3">
						{messages.map((msg) => {
							const isMe = msg.sender_id === user.id

							return (
								<div
									key={msg.id}
									className={`flex ${isMe ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-[75%] rounded-xl px-3 py-2 shadow-sm ${
											isMe
												? "bg-primary text-white"
												: "bg-gray-200 text-gray-900"
										}`}
									>
										{msg.content}
									</div>
								</div>
							)
						})}
						<div ref={bottomRef} />
					</div>
				)}
			</div>

			{/* Input */}
			<div className="flex gap-2 border-t p-3">
				<Textarea
					value={content}
					placeholder="Type your message..."
					className="w-full resize-none"
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault()
							handleSend()
						}
					}}
				/>
				<Button onClick={handleSend} disabled={!content.trim()}>
					Send
				</Button>
			</div>
		</div>
	)
}

export default Conversation
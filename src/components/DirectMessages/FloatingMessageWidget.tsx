import React, { useState, useEffect } from "react"
import { MessageSquare, X, Minimize2, ArrowLeft, PlusSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ConversationsList from "./ConversationList"
import ConversationView from "./ConversationView"
import { useMessagingStore } from "@/stores/messagingStore"
import RecipientInput from "./NewChatInput"

interface UserListItem {
	id: string
	name?: string
	avatar?: string
}

const FloatingMessagingWidget: React.FC = () => {
	const recipientId = useMessagingStore((state) => state.recipientId)
	const recipientName = useMessagingStore((state) => state.recipientName)
	const recipientAvatar = useMessagingStore((state) => state.recipientAvatar)
	const clearRecipient = useMessagingStore((state) => state.clearRecipient)

	const [isOpen, setIsOpen] = useState(!!recipientId)
	const [isMinimized, setIsMinimized] = useState(false)
	const [newChat, setNewChat] = useState(false)
	const [unreadCount] = useState(0) // TODO: Implement unread count from DB
	const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)

	useEffect(() => {
		if (recipientId) {
			setIsOpen(true)
			setIsMinimized(false)
			setSelectedUser({
				id: recipientId,
				name: recipientName || undefined,
				avatar: recipientAvatar || undefined,
			})
		}
	}, [recipientId, recipientName, recipientAvatar])

	const handleOpen = () => {
		setIsOpen(true)
		setIsMinimized(false)
	}

	const truncate = (text: string, max: number) => (text.length > max ? text.slice(0, max) + "…" : text)

	const handleClose = () => {
		setIsOpen(false)
		setSelectedUser(null)
		clearRecipient()
	}

	const handleSelectUser = (user: UserListItem) => {
		setSelectedUser(user)
	}

	const handleBack = () => {
		setSelectedUser(null)
		clearRecipient()
	}

	const newChatFn = () => {
		setSelectedUser(null)
		setNewChat(!newChat)
	}

	return (
		<>
			{/* Floating Button */}
			{!isOpen && (
				<button
					onClick={handleOpen}
					className="duration-600 fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform ease-in hover:scale-110 max-sm:bottom-20 max-sm:right-2 max-sm:h-10 max-sm:w-10">
					<MessageSquare className="h-6 w-6 max-sm:h-5 max-sm:w-5" />
					{unreadCount > 0 && <Badge className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-0">{unreadCount}</Badge>}
				</button>
			)}

			{/* Messaging Window */}
			{isOpen && (
				<div className={`fixed bottom-0 right-2 z-50 bg-white rounded-t-lg shadow-2xl border border-border transition-all duration-300 ${isMinimized ? "h-10 w-60" : "h-[600px] w-[300px]"}`}>
					{/* Header */}
					<div className="flex items-center justify-between border-b bg-card px-3 py-2">
						<div className="flex items-center gap-2">
							{selectedUser && !isMinimized && (
								<Button
									variant="ghost"
									size="icon"
									className="-ml-2 h-8 w-8"
									onClick={handleBack}>
									<ArrowLeft className="h-4 w-4" />
								</Button>
							)}
							<MessageSquare className="h-4 w-4" />
							<h3 className="text-sm font-semibold">{selectedUser ? truncate(selectedUser.name || "Chat", 7) : newChat ? "New Chat" : "Inbox"}</h3>
							{unreadCount > 0 && !selectedUser && (
								<Badge
									variant="secondary"
									className="ml-1">
									{unreadCount}
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="icon"
								className={`${newChat && "bg-primary text-white"} h-8 w-8`}
								onClick={newChatFn}>
								<PlusSquare className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => (setNewChat(false), setIsMinimized(!isMinimized))}>
								<Minimize2 className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={handleClose}>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{newChat && (
						<RecipientInput
							onStartChat={(user) => {
								setSelectedUser(user)
								setNewChat(false)
							}}
						/>
					)}
					{/* Content Area */}
					{!isMinimized && !newChat && (
						<div className="h-[calc(600px-56px)] overflow-hidden">
							{selectedUser ? (
								<ConversationView
									otherUserId={selectedUser.id}
									otherUserName={selectedUser.name}
									otherUserAvatar={selectedUser.avatar}
								/>
							) : (
								<ConversationsList onSelectUser={handleSelectUser} />
							)}
						</div>
					)}
				</div>
			)}
		</>
	)
}

export default FloatingMessagingWidget

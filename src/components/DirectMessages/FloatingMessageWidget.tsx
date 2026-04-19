import React, { useState, useEffect } from "react"
import {
  MessageSquare,
  X,
  Minimize2,
  ArrowLeft,
  PlusSquare,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ConversationsList from "./ConversationList"
import ConversationView from "./ConversationView"
import RecipientInput from "./NewChatInput"
import { useMessagingStore } from "@/stores/messagingStore"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

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
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [activeTab, setActiveTab] = useState<"inbox" | "chat">("inbox")

  const unreadCount = 0

  //Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  //Open externally triggered chat
  useEffect(() => {
    if (recipientId) {
      setIsOpen(true)
      setSelectedUser({
        id: recipientId,
        name: recipientName || undefined,
        avatar: recipientAvatar || undefined,
      })
      setActiveTab("chat")
    }
  }, [recipientId, recipientName, recipientAvatar])

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSelectedUser(null)
    setActiveTab("inbox")
    clearRecipient()
  }

  const handleBack = () => {
    setSelectedUser(null)
    setActiveTab("inbox")
    clearRecipient()
  }

  const handleSelectUser = (user: UserListItem) => {
    setSelectedUser(user)
    setActiveTab("chat")
  }

  return (
    <>
      {/* FLOATING BUTTON */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition"
        >
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center rounded-full bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </button>
      )}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-100 transition-opacity duration-300"
            onClick={handleClose}
          />

          {/* MODAL CONTENT */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative bg-[#f0f2f5] border rounded-2xl shadow-2xl transform transition-all duration-300 ${
              isMinimized
                ? "h-12 w-72 scale-95 opacity-90"
                : "h-[600px] w-[420px] scale-100 opacity-100"
            }`}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-3 py-2 bg-white border-b rounded-t-2xl">
              
              <div className="flex items-center gap-2 flex-1">
                {selectedUser && (
                  <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}

                {selectedUser ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback>
                        {selectedUser.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold">
                        {selectedUser.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Active now
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-semibold">
                    {activeTab === "chat" ? "New Message" : "Messages"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setActiveTab("chat")
                    setSelectedUser(null)
                  }}
                >
                  <PlusSquare className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* TABS */}
            {!selectedUser && (
              <div className="flex bg-white border-b">
                <button
                  onClick={() => setActiveTab("inbox")}
                  className={`flex-1 py-2 text-sm font-semibold ${
                    activeTab === "inbox"
                      ? "border-b-2 border-primary text-primary bg-muted/40"
                      : "text-muted-foreground"
                  }`}
                >
                  Inbox
                </button>

                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 py-2 text-sm ${
                    activeTab === "chat"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Chat
                </button>
              </div>
            )}

            {/* CONTENT */}
            {!isMinimized && (
              <div className="h-[calc(600px-110px)] overflow-hidden">

                {/* INBOX */}
                {activeTab === "inbox" && !selectedUser && (
                  <ConversationsList onSelectUser={handleSelectUser} />
                )}

                {/* CHAT */}
                {activeTab === "chat" && !selectedUser && (
                  <RecipientInput
                    onStartChat={(user) => {
                      setSelectedUser(user)
                    }}
                  />
                )}

                {/* ACTIVE CHAT */}
                {selectedUser && (
                  <ConversationView
                    otherUserId={selectedUser.id}
                    otherUserName={selectedUser.name}
                    otherUserAvatar={selectedUser.avatar}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingMessagingWidget
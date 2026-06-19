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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  const [activeTab, setActiveTab] = useState<"inbox" | "chat">("chat")
  const [animate, setAnimate] = useState(false)

  const unreadCount = 0

  // 🔒 Prevent background scroll (no jump)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ""
      document.body.style.top = ""
      window.scrollTo(0, parseInt(scrollY || "0") * -1)
    }

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
    }
  }, [isOpen])

  // ✨ Animate modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setAnimate(true), 10)
    } else {
      setAnimate(false)
    }
  }, [isOpen])

  // 📩 External open
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

  const handleOpen = () => setIsOpen(true)

  const handleClose = () => {
    setAnimate(false)
    setTimeout(() => {
      setIsOpen(false)
      setSelectedUser(null)
      setActiveTab("inbox")
      clearRecipient()
    }, 200)
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
          className="
            fixed
            bottom-16 right-3
            sm:bottom-4 sm:right-4
            md:bottom-6 md:right-4
            z-50

            flex items-center justify-center

            h-12 w-12
            sm:h-14 sm:w-14

            rounded-full
            bg-primary
            text-primary-foreground

            shadow-lg
            transition-all duration-200
            hover:scale-110
            active:scale-95
          "
        >
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />

          {unreadCount > 0 && (
            <Badge
              className="
                absolute
                -right-1 -top-1

                flex items-center justify-center

                h-5 w-5
                sm:h-6 sm:w-6

                rounded-full
                bg-red-500
                text-[10px]
                sm:text-xs
                text-white
              "
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
       </button>
      )}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* BACKDROP */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
              }`}
            onClick={handleClose}
          />

          {/* MODAL CONTENT */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 w-full max-w-md mx-4 ${isMinimized
              ? "h-12 scale-95 opacity-90"
              : "h-[85vh] max-h-[600px]"
              } ${animate
                ? "scale-100 opacity-100 translate-y-0"
                : "scale-95 opacity-0 translate-y-4"
              }`}
          >
            {/* HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-3 py-2 rounded-t-2xl">
              <div className="flex flex-1 items-center gap-2">
                {selectedUser && (
                  <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}

                {selectedUser ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {selectedUser.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-foreground">
                        {selectedUser.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Active now
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-foreground">
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
                  title="New message"
                >
                  <PlusSquare className="h-4 w-4" />
                </Button>

                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? "Expand" : "Minimise"}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button> */}

                

                <Button variant="ghost" size="icon" onClick={handleClose} title="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* TABS (only when no conversation is open) */}
            {!selectedUser && (
              <div className="flex shrink-0 border-b border-border bg-card">
                <button
                  onClick={() => setActiveTab("inbox")}
                  className={`flex-1 py-2 text-sm font-semibold transition-colors ${activeTab === "inbox"
                    ? "border-b-2 border-primary bg-muted/40 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Inbox
                </button>

                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 py-2 text-sm transition-colors ${activeTab === "chat"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Chat
                </button>
              </div>
            )}

            {/* CONTENT */}
            {!isMinimized && (
              <div className="min-h-0 flex-1 overflow-hidden bg-card">

                {/* INBOX */}
                {activeTab === "inbox" && !selectedUser && (
                  <ConversationsList onSelectUser={handleSelectUser} />
                )}

                {/* NEW CHAT */}
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
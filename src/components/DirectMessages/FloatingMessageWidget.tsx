import React, { useState, useEffect, useRef } from "react"
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
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


interface UserListItem {
  id: string
  name?: string
  avatar?: string
}

const FloatingMessagingWidget: React.FC = () => {
  const { user } = useAuth()
  const recipientId = useMessagingStore((state) => state.recipientId)
  const recipientName = useMessagingStore((state) => state.recipientName)
  const recipientAvatar = useMessagingStore((state) => state.recipientAvatar)
  const clearRecipient = useMessagingStore((state) => state.clearRecipient)
  const setCurrentUser = useMessagingStore((state) => state.setCurrentUser)
  const subscribeToMessages = useMessagingStore((state) => state.subscribeToMessages)
  const unsubscribeFromMessages = useMessagingStore((state) => state.unsubscribeFromMessages)

  const [isOpen, setIsOpen] = useState(!!recipientId)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [activeTab, setActiveTab] = useState<"inbox" | "chat">("chat")
  const [animate, setAnimate] = useState(false)

          
  const buttonRef = useRef<HTMLButtonElement>(null)


  const [position, setPosition] = useState({
    x: window.innerWidth - 70,
    y: window.innerHeight - 140,
  })

  //draggable
  const dragging = useRef(false)
  const moved = useRef(false)
  const start = useRef({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
  })

  const unreadCounts = useMessagingStore((state) => state.unreadCounts)

  const unreadCount = Object.values(unreadCounts).reduce(
    (sum, count) => sum + count,
    0
  )

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

  // Initialize real-time subscription when user is available
  useEffect(() => {
    if (!user) return

    setCurrentUser(user.id)
    subscribeToMessages()

    return () => {
      unsubscribeFromMessages()
    }
  }, [user])

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

  //handle draggable
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
  if (window.innerWidth >= 640) return // Desktop = no dragging

  dragging.current = true
  moved.current = false

  start.current = {
    x: e.clientX,
    y: e.clientY,
    offsetX: e.clientX - position.x,
    offsetY: e.clientY - position.y,
  }

  e.currentTarget.setPointerCapture(e.pointerId)
}

const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
  if (!dragging.current) return

  const dx = Math.abs(e.clientX - start.current.x)
  const dy = Math.abs(e.clientY - start.current.y)

  if (dx > 5 || dy > 5) {
    moved.current = true
  }

  const size = 56

  let x = e.clientX - start.current.offsetX
  let y = e.clientY - start.current.offsetY

  x = Math.max(8, Math.min(window.innerWidth - size - 8, x))
  y = Math.max(8, Math.min(window.innerHeight - size - 8, y))

  setPosition({ x, y })
}

const handlePointerUp = () => {
  dragging.current = false

  if (!moved.current) {
    handleOpen()
  }
}

  return (
    <>
      {/* FLOATING BUTTON */}
      {!isOpen && (
       <button
        ref={buttonRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
       
        style={
          window.innerWidth < 640
            ? {
                left: position.x,
                top: position.y,
              }
            : undefined
        }
        className="
          fixed
          z-[999]
          flex items-center justify-center
          h-14 w-14
          rounded-full
          bg-primary
          text-primary-foreground
          shadow-2xl
          ring-2 ring-background
          transition-shadow
          touch-none
          select-none
          sm:bottom-5
          sm:right-5
          "
        >
          <MessageSquare className="h-6 w-6" />

          {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500">
                  {unreadCount}
              </Badge>
          )}
      </button>
      )}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">

          {/* BACKDROP */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"
              }`}
            onClick={handleClose}
          />

          {/* MODAL CONTENT */}
          <div
            onClick={(e) => e.stopPropagation()}
           className={`relative flex flex-col overflow-hidden border border-border bg-card shadow-2xl transition-all duration-300 w-screen sm:w-[430px] md:w-[460px] mx-0 sm:mx-4 rounded-t-2xl sm:rounded-2xl
            ${
              isMinimized
                ? "h-12"
                : "h-[92vh] sm:h-[85vh] max-h-[720px]"
            }

            ${
              animate
                ? "translate-y-0 opacity-100"
                : "translate-y-[100%] sm:translate-y-4 opacity-0"
            }
          `}>
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
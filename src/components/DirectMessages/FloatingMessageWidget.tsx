import React, { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  X,
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
import { directMessagesService } from "@/services/directMessagesService"


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
  const setUnreadCounts = useMessagingStore((state) => state.setUnreadCounts)
  const subscribeToMessages = useMessagingStore((state) => state.subscribeToMessages)
  const unsubscribeFromMessages = useMessagingStore((state) => state.unsubscribeFromMessages)

  const [isOpen, setIsOpen] = useState(!!recipientId)
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [activeTab, setActiveTab] = useState<"inbox" | "chat">("inbox")
  const [animate, setAnimate] = useState(false)

          
  const buttonRef = useRef<HTMLButtonElement>(null)


 const [position, setPosition] = useState({
  x: 0,
  y: 0,
})

useEffect(() => {
  const placeButton = () => {
    setPosition((current) => ({
      x: Math.min(current.x || window.innerWidth - 72, window.innerWidth - 72),
      y: Math.min(current.y || window.innerHeight - 144, window.innerHeight - 144),
    }))
  }

  placeButton()
  window.addEventListener("resize", placeButton)
  return () => window.removeEventListener("resize", placeButton)
}, [])

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

  useEffect(() => {
    if (!isOpen) return

    const isMobile = window.innerWidth < 768
    if (!isMobile) return

    const scrollY = window.scrollY
    const previousStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    }

    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = "0"
    document.body.style.right = "0"
    document.body.style.width = "100%"
    document.body.style.overflow = "hidden"

    return () => {
      Object.assign(document.body.style, previousStyles)
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  // Initialize real-time subscription when user is available
  useEffect(() => {
    if (!user) return

    setCurrentUser(user.id)
    subscribeToMessages()
    let active = true
    void directMessagesService.getUnreadCountsForUser(user.id).then(({ data, error }) => {
      if (!active) return
      if (error) {
        console.error("[Messaging] Failed to load unread counts:", error)
        return
      }
      setUnreadCounts(data || {})
    })

    return () => {
      active = false
      unsubscribeFromMessages()
    }
  }, [setCurrentUser, setUnreadCounts, subscribeToMessages, unsubscribeFromMessages, user])

  // ✨ Animate panel
  useEffect(() => {
    if (isOpen) {
      const timeout = window.setTimeout(() => setAnimate(true), 10)
      return () => window.clearTimeout(timeout)
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

  const handleOpen = () => {
    setActiveTab("inbox")
    setIsOpen(true)
  }

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
    useMessagingStore.getState().openConversation(user.id, user.name, user.avatar)
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
}

const handlePointerCancel = () => {
  dragging.current = false
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
        onPointerCancel={handlePointerCancel}
        onClick={() => {
          if (!moved.current) handleOpen()
        }}
       
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
        aria-label={`Open messages${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <MessageSquare className="h-6 w-6" />

          {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-red-500">
                  {unreadCount}
              </Badge>
          )}
      </button>
      )}

      
      {/* PANEL — Mobile: full-screen modal */}
      {isOpen && (
  <>
    {/* Mobile backdrop */}
    <div
      className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
        animate ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    />

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-end
        justify-end
        p-0
        md:items-end
        md:justify-end
        md:p-6
        pointer-events-none
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Messages"
        className={`
          relative
          flex
          flex-col
          overflow-hidden
          border
          border-border
          bg-card
          shadow-2xl
          transition-all
          duration-300

          pointer-events-auto

          h-[100dvh]
          w-full
          min-h-0
          min-w-0
          pt-[env(safe-area-inset-top)]
          pb-[env(safe-area-inset-bottom)]
          rounded-none

          md:h-[min(650px,calc(100dvh-3rem))]
          md:w-[460px]
          md:rounded-2xl

          ${
            animate
              ? "translate-y-0 translate-x-0 scale-100 opacity-100"
              : "translate-y-8 translate-x-8 scale-95 opacity-0"
          }
        `}
      >
                {/* HEADER */}
                <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-3 py-2.5">
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    {selectedUser && (
                      <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}

                          {selectedUser ? (
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative shrink-0">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={selectedUser.avatar} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {selectedUser.name?.[0] || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              </div>

                              <div className="flex flex-col leading-tight min-w-0">
                                <span className="text-sm font-semibold text-foreground truncate">
                                  {selectedUser.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">Direct message</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-foreground">
                              {activeTab === "chat" ? "New Message" : "Messages"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              clearRecipient()
                              setActiveTab("chat")
                              setSelectedUser(null)
                            }}
                            title="New message"
                          >
                            <PlusSquare className="h-4 w-4" />
                          </Button>

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
                            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${activeTab === "inbox"
                              ? "border-b-2 border-primary bg-muted/40 text-primary"
                              : "text-muted-foreground hover:text-foreground"
                              }`}
                          >
                            Inbox
                            {unreadCount > 0 && (
                              <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => setActiveTab("chat")}
                            className={`flex-1 py-2.5 text-sm transition-colors ${activeTab === "chat"
                              ? "border-b-2 border-primary text-primary"
                              : "text-muted-foreground hover:text-foreground"
                              }`}
                          >
                            New Chat
                          </button>
                        </div>
                      )}

                      {/* CONTENT */}
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
                              useMessagingStore.getState().openConversation(
                                user.id,
                                user.name,
                                user.avatar,
                              )
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
                    </div>
                  </div>

                </>
              )}
    </>
  )

}

export default FloatingMessagingWidget
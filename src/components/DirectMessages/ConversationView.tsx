import React, { useEffect, useRef, useState } from "react"
import { directMessagesService, Message } from "@/services/directMessagesService"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Loader2,
  Paperclip,
  MoreVertical,
  MessageSquare,
} from "lucide-react"
import { useMessagingStore } from "@/stores/messagingStore"
import { formatTimestamp, compressImage, cn } from "@/lib/utils"
import EmojiPickerButton from "../EmojiPicker"
import { supabase } from "@/integrations/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ConversationViewProps {
  otherUserId: string
  otherUserName?: string
  otherUserAvatar?: string
}

type ConversationItem =
  | ({ type: "message" } & Message)
  | { type: "separator"; id: string; dateLabel: string }

const addDateSeparators = (messages: Message[]): ConversationItem[] => {
  const items: ConversationItem[] = []
  let lastDate: string | null = null

 

  const sorted = [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  )

  sorted.forEach((msg, i) => {
    const dateKey = new Date(msg.created_at)
      .toISOString()
      .split("T")[0]

    if (dateKey !== lastDate) {
      items.push({
        type: "separator",
        id: `sep-${dateKey}-${i}`,
        dateLabel: formatTimestamp(
          msg.created_at,
          false
        ),
      })

      lastDate = dateKey
    }

    items.push({ ...msg, type: "message" })
  })

  return items
}

const ConversationView: React.FC<
  ConversationViewProps
> = ({
  otherUserId,
  otherUserName,
  otherUserAvatar,
}) => {
  const { user } = useAuth()
  const { toast } = useToast()

  const messages =
    useMessagingStore(
      (s) => s.messagesByUserId[otherUserId]
    ) ?? []

  const loading =
    useMessagingStore(
      (s) => s.loadingStatus[otherUserId] || false
    )

  const fetchMessages =
    useMessagingStore((s) => s.fetchMessages)

  const fetchOlderMessages =
    useMessagingStore((s) => s.fetchOlderMessages)

  const addMessage =
    useMessagingStore((s) => s.addMessage)

  const removeMessage =
    useMessagingStore((s) => s.removeMessage)

  const updateMessage =
    useMessagingStore((s) => s.updateMessage)

  const markConversationRead =
    useMessagingStore((s) => s.markConversationRead)

  const [sending, setSending] = useState(false)
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(
    null
  )

  const [editingId, setEditingId] = useState<
    string | null
  >(null)

  const [editingText, setEditingText] =
    useState("")

  const [openMenuId, setOpenMenuId] = useState<
    string | null
  >(null)

  const [loadingOlder, setLoadingOlder] =
    useState(false)
  const [hasMoreOlder, setHasMoreOlder] =
    useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  const conversationItems = React.useMemo(
    () => addDateSeparators(messages),
    [messages]
  )

  useEffect(() => {
    if (!user || !otherUserId) return

    fetchMessages(user.id, otherUserId)
  }, [user, otherUserId])

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!user || !otherUserId) return

    markConversationRead(otherUserId)
    directMessagesService.markMessagesAsRead(
      user.id,
      otherUserId
    )
  }, [user, otherUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages.length])

  const handleSend = async () => {
    if (
      !user ||
      (!content.trim() && !file) ||
      sending
    )
      return

    setSending(true)

    const tempId = `temp-${Date.now()}`

    const preview = file
      ? URL.createObjectURL(file)
      : null

    const optimisticMessage: Message = {
      id: tempId,
      sender_id: user.id,
      recipient_id: otherUserId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      read: false,
      image_url: null,
      image_type: null,
      status: "sending",
      localPreview: preview,
    }

    addMessage(optimisticMessage)

    let image_url: string | undefined

    let image_type: "image" | "pdf" | null =
      null

    try {
      if (file) {
        let fileToUpload = file

        if (file.type.startsWith("image/")) {
          fileToUpload = await compressImage(file)
        }

        const path = `chat/${user.id}-${Date.now()}`

        await supabase.storage
          .from("uploads")
          .upload(path, fileToUpload)

        const { data } = supabase.storage
          .from("uploads")
          .getPublicUrl(path)

        image_url = data.publicUrl

        image_type = file.type.startsWith(
          "image"
        )
          ? "image"
          : "pdf"
      }

      const { data, error } =
        await directMessagesService.sendMessage({
          sender_id: user.id,
          recipient_id: otherUserId,
          content: content.trim(),
          image_url,
          image_type,
        })

      if (error) throw error

      removeMessage(tempId)

      if (data) {
        addMessage({
          ...data,
          status: "sent",
        })
      }

      setContent("")
      setFile(null)
    } catch (err: any) {
      updateMessage({
        ...optimisticMessage,
        status: "failed",
      })

      toast({
        title: "Send failed",
        description: err.message,
        variant: "destructive",
      })
    }

    setSending(false)
  }

  const handleDelete = async (id: string) => {
    await directMessagesService.deleteMessage(id)

    removeMessage(id)
  }

  const handleRetry = async (msg: Message) => {
    if (!user || sending) return

    setSending(true)

    const tempId = `temp-${Date.now()}`

    const retryMessage: Message = {
      ...msg,
      id: tempId,
      status: "sending",
    }

    removeMessage(msg.id)
    addMessage(retryMessage)

    try {
      const { data, error } =
        await directMessagesService.sendMessage({
          sender_id: user.id,
          recipient_id: otherUserId,
          content: msg.content || "",
          image_url: msg.image_url || undefined,
          image_type: msg.image_type || null,
        })

      if (error) throw error

      removeMessage(tempId)

      if (data) {
        addMessage({
          ...data,
          status: "sent",
        })
      }
    } catch (err: any) {
      updateMessage({
        ...retryMessage,
        status: "failed",
      })

      toast({
        title: "Send failed",
        description: err.message,
        variant: "destructive",
      })
    }

    setSending(false)
  }

  const handleEdit = async (id: string) => {
    const { data } =
      await directMessagesService.updateMessage({
        id,
        content: editingText,
      })

    if (data) {
      updateMessage(data)
      setEditingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-background">

      {/* HEADER */}
     

      {/* MESSAGES */}
      <ScrollArea className="flex-1 bg-muted/10 px-3 py-4">
        <div className="space-y-3">
          {/* EMPTY STATE */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No messages yet
              </p>
              <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
                Send a message below to start the conversation
              </p>
            </div>
          )}

          {/* LOAD OLDER MESSAGES */}
          {messages.length > 0 && hasMoreOlder && (
            <div className="flex justify-center">
              <button
                onClick={async () => {
                  setLoadingOlder(true)
                  const prevCount = messages.length
                  await fetchOlderMessages(
                    user!.id,
                    otherUserId
                  )
                  // If no new messages were added, there are no more
                  const newCount =
                    useMessagingStore.getState()
                      .messagesByUserId[otherUserId]
                      ?.length ?? 0
                  if (
                    newCount - prevCount <
                    20
                  ) {
                    setHasMoreOlder(false)
                  }
                  setLoadingOlder(false)
                }}
                disabled={loadingOlder}
                className="rounded-full border px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {loadingOlder
                  ? "Loading..."
                  : "Load older messages"}
              </button>
            </div>
          )}

          {conversationItems.map((item) => {
            if (item.type === "separator") {
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-1"
                >
                  <div className="h-px flex-1 bg-border" />

                  <span className="rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
                    {item.dateLabel}
                  </span>

                  <div className="h-px flex-1 bg-border" />
                </div>
              )
            }

            const msg = item

            const isOwn =
              msg.sender_id === user?.id

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  isOwn
                    ? "justify-end"
                    : "justify-start"
                )}
              >
                <div className="relative max-w-[82%]">

                  {isOwn && (
                    <div className="absolute right-1 top-1 z-10">
                      <button
                        onClick={() =>
                          setOpenMenuId(
                            openMenuId === msg.id
                              ? null
                              : msg.id
                          )
                        }
                        className="rounded p-1 text-primary-foreground/60 hover:bg-black/10"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openMenuId === msg.id && (
                        <div className="absolute right-0 mt-1 w-24 overflow-hidden rounded-md border bg-popover shadow-lg">
                          <button
                            onClick={() => {
                              setEditingId(msg.id)
                              setEditingText(
                                msg.content || ""
                              )

                              setOpenMenuId(null)
                            }}
                            className="block w-full px-3 py-2 text-left text-xs hover:bg-muted"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(msg.id)
                            }
                            className="block w-full px-3 py-2 text-left text-xs text-destructive hover:bg-muted"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {editingId === msg.id ? (
                    <div className="flex gap-2 rounded-xl border bg-card p-2">
                      <input
                        autoFocus
                        value={editingText}
                        onChange={(e) =>
                          setEditingText(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleEdit(msg.id)

                          if (e.key === "Escape")
                            setEditingId(null)
                        }}
                        className="flex-1 bg-transparent text-sm outline-none"
                      />

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleEdit(msg.id)
                        }
                      >
                        Save
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEditingId(null)
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm",
                        isOwn
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm border bg-card"
                      )}
                    >
                      {msg.content && (
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {msg.content}
                        </p>
                      )}

                      {(msg.localPreview ||
                        msg.image_url) && (
                        <img
                          src={
                            msg.localPreview ||
                            msg.image_url!
                          }
                          className="mt-2 max-h-60 rounded-xl object-cover"
                          alt="attachment"
                        />
                      )}

                      {msg.image_type === "pdf" &&
                        !msg.localPreview && (
                          <a
                            href={msg.image_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 block text-xs underline"
                          >
                            📄 View PDF
                          </a>
                        )}

                      <p
                        className={cn(
                          "mt-1 text-right text-[10px]",
                          isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {new Date(
                          msg.created_at
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                        {msg.status ===
                          "sending" &&
                          " · Sending…"}

                        {msg.status ===
                          "failed" && (
                          <span className="text-red-400">
                            {" "}
                            · Failed
                            <button
                              onClick={() =>
                                handleRetry(msg)
                              }
                              className="ml-1.5 text-xs text-primary underline hover:text-primary/80"
                            >
                              Retry
                            </button>
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* INPUT */}
      <div className="border-t bg-card px-3 py-3">

        {/* FILE PREVIEW */}
        {file && (
          <div className="mb-2 flex items-center justify-between rounded-lg border bg-muted px-3 py-2 text-xs">
            <span className="truncate">
              {file.name}
            </span>

            <button
              onClick={() => setFile(null)}
              className="text-destructive"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 w-full">

          {/* EMOJI */}
          <EmojiPickerButton
            onSelect={(e) =>
              setContent((p) => p + e)
            }
          />

          {/* FILE */}
          <Button
            size="icon"
            variant="ghost"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* INPUT */}
          <div className="flex flex-1 items-end rounded-2xl border bg-background px-3 py-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  (e.ctrlKey || e.metaKey)
                ) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type a message..."
              rows={5}
              className="
                min-h-[60px]
                max-h-[160px]
                resize-none
                border-0
                bg-transparent
                shadow-none
                focus-visible:ring-0
                overflow-y-auto
                leading-relaxed
                text-sm
                px-0
              "
            />
          </div>

          {/* SEND */}
          <Button
            onClick={handleSend}
            size="icon"
            disabled={
              sending ||
              (!content.trim() && !file)
            }
            className="rounded-xl"
          >
            {sending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={(e) => {
            const f = e.target.files?.[0]

            if (!f) return

            setFile(f)

            toast({
              title: "File attached",
              description: f.name,
            })
          }}
        />
      </div>
    </div>
  )
}

export default ConversationView
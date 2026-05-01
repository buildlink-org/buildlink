import React, { useEffect, useRef, useState } from "react"
import { directMessagesService, Message } from "@/services/directMessagesService"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2, Paperclip, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessagingStore } from "@/stores/messagingStore"
import { formatTimestamp } from "@/lib/utils"
import EmojiPickerButton from "../EmojiPicker"
import { supabase } from "@/integrations/supabase/client"
import { compressImage } from "@/lib/utils"

interface ConversationViewProps {
  otherUserId: string
  otherUserName?: string
  otherUserAvatar?: string
}

type ConversationItem =
  | ({ type: "message" } & Message)
  | { type: "separator"; id: string; dateLabel: string }

// -------- DATE SEPARATORS --------
const addDateSeparators = (messages: Message[]): ConversationItem[] => {
  const items: ConversationItem[] = []
  let lastDate: string | null = null

  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  sorted.forEach((msg, i) => {
    const dateKey = new Date(msg.created_at).toISOString().split("T")[0]

    if (dateKey !== lastDate) {
      items.push({
        type: "separator",
        id: `sep-${dateKey}-${i}`,
        dateLabel: formatTimestamp(msg.created_at, false),
      })
      lastDate = dateKey
    }

    items.push({ ...msg, type: "message" })
  })

  return items
}

const ConversationView: React.FC<ConversationViewProps> = ({
  otherUserId,
  otherUserName,
  otherUserAvatar,
}) => {
  const { user } = useAuth()
  const { toast } = useToast()

  const messages =
    useMessagingStore((s) => s.messagesByUserId[otherUserId]) ?? []
  const loading =
    useMessagingStore((s) => s.loadingStatus[otherUserId] || false)
  const fetchMessages = useMessagingStore((s) => s.fetchMessages)
  const addMessage = useMessagingStore((s) => s.addMessage)
  const removeMessage = useMessagingStore((s) => s.removeMessage)
  const updateMessage = useMessagingStore((s) => s.updateMessage)

  const [sending, setSending] = useState(false)
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const conversationItems = React.useMemo(
    () => addDateSeparators(messages),
    [messages]
  )

  // -------- FETCH --------
  useEffect(() => {
    if (!user || !otherUserId) return
    fetchMessages(user.id, otherUserId)
  }, [user, otherUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  // -------- SEND --------
  const handleSend = async () => {
    if (!user || (!content.trim() && !file) || sending) return

    setSending(true)

    let image_url: string | undefined
    let image_type: "image" | "pdf" | null = null

    try {
      if (file) {
        let fileToUpload = file

        if (file.type.startsWith("image/")) {
          fileToUpload = await compressImage(file)
        }

        const path = `chat/${user.id}-${Date.now()}`
        await supabase.storage.from("uploads").upload(path, fileToUpload)

        const { data } = supabase.storage.from("uploads").getPublicUrl(path)

        image_url = data.publicUrl
        image_type = file.type.startsWith("image") ? "image" : "pdf"
      }

      const { data, error } = await directMessagesService.sendMessage({
        sender_id: user.id,
        recipient_id: otherUserId,
        content: content.trim(),
        image_url,
        image_type,
      })

      if (error) throw error

      if (data) {
        addMessage(data)
        setContent("")
        setFile(null)
      }
    } catch (err: any) {
      toast({ title: "Send failed", description: err.message })
    }

    setSending(false)
  }

  // -------- DELETE --------
  const handleDelete = async (id: string) => {
    await directMessagesService.deleteMessage(id)
    removeMessage(id)
  }

  // -------- EDIT --------
  const handleEdit = async (id: string) => {
    const { data } = await directMessagesService.updateMessage({
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
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">

      {/* -------- MESSAGES -------- */}
      <ScrollArea className="flex-1 bg-[#efeae2] px-2 sm:px-3">
        <div className="space-y-3 sm:space-y-4">
          {conversationItems.map((item) => {
            if (item.type === "separator") {
              return (
                <div key={item.id} className="text-center text-xs">
                  {item.dateLabel}
                </div>
              )
            }

            const msg = item
            const isOwn = msg.sender_id === user?.id

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  isOwn ? "justify-end" : "justify-start"
                )}
              >
                <div className="relative max-w-[85%] sm:max-w-[70%]">

                  {/* 3 DOT MENU */}
                  {isOwn && (
                    <div className="absolute top-1 right-1">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === msg.id ? null : msg.id)
                        }
                        className="p-1 rounded hover:bg-black/10"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openMenuId === msg.id && (
                        <div className="absolute right-0 mt-1 w-24 rounded-md bg-white shadow border text-xs z-50">
                          <button
                            onClick={() => {
                              setEditingId(msg.id)
                              setEditingText(msg.content || "")
                              setOpenMenuId(null)
                            }}
                            className="block w-full px-3 py-2 hover:bg-muted text-left"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="block w-full px-3 py-2 hover:bg-muted text-left text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 sm:px-4",
                      isOwn ? "bg-primary text-white" : "bg-white"
                    )}
                  >
                    {editingId === msg.id ? (
                      <>
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-2 mt-2 text-xs">
                          <button onClick={() => handleEdit(msg.id)}>Save</button>
                          <button onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        {msg.content && <p className="text-sm">{msg.content}</p>}

                        {msg.image_url && msg.image_type === "image" && (
                          <img
                            src={msg.image_url}
                            className="mt-2 rounded-md max-h-60"
                          />
                        )}

                        {msg.image_type === "pdf" && (
                          <a href={msg.image_url} className="text-xs underline">
                            📄 View PDF
                          </a>
                        )}

                        <p className="text-[10px] opacity-70 text-right mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* -------- INPUT -------- */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">

          <EmojiPickerButton
            onSelect={(e) => setContent((p) => p + e)}
          />

          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="min-h-[50px] flex-1 resize-none"
          />

          <Button onClick={handleSend} size="icon">
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>

        {file && (
          <div className="mt-2 flex justify-between text-xs bg-muted px-2 py-1 rounded">
            <span className="truncate">{file.name}</span>
            <button onClick={() => setFile(null)} className="text-red-500">
              Remove
            </button>
          </div>
        )}

        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (!f) return
            setFile(f)
            toast({ title: "File attached", description: f.name })
          }}
        />
      </div>
    </div>
  )
}

export default ConversationView
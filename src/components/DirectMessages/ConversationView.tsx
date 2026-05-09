import React, { useEffect, useRef, useState } from "react"
import { directMessagesService, Message } from "@/services/directMessagesService"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2, Paperclip, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessagingStore } from "@/stores/messagingStore"
import EmojiPickerButton from "../EmojiPicker"
import { supabase } from "@/integrations/supabase/client"
import { compressImage } from "@/lib/utils"

interface ConversationViewProps {
  otherUserId: string
}

const ConversationView: React.FC<ConversationViewProps> = ({
  otherUserId,
}) => {
  const { user } = useAuth()
  const { toast } = useToast()

  const messages =
    useMessagingStore((s) => s.messagesByUserId[otherUserId]) ?? []
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

  useEffect(() => {
    if (!user) return
    fetchMessages(user.id, otherUserId)
  }, [user, otherUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  // ✅ SEND (Optimistic UI)
  const handleSend = async () => {
    if (!user || (!content.trim() && !file) || sending) return

    setSending(true)

    const tempId = `temp-${Date.now()}`
    const preview = file ? URL.createObjectURL(file) : null

    const optimisticMessage: Message & any = {
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

      removeMessage(tempId)

      if (data) {
        addMessage(data)
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

  return (
    <div className="flex h-full flex-col">

      {/* MESSAGES */}
      <ScrollArea className="flex-1 bg-[#efeae2] px-2 sm:px-4 py-2">
        <div className="space-y-3">
          {messages.map((msg: any) => {
            const isOwn = msg.sender_id === user?.id

            return (
              <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>

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
                        <div className="absolute right-0 mt-1 w-24 bg-white shadow border rounded text-xs z-50">
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
                            className="block w-full px-3 py-2 hover:bg-muted text-red-500 text-left"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 trasaction",
                      isOwn ? "bg-primary text-white" : "bg-white",
                      editingId === msg.id && "ring-1 ring-primary/40"
                    )}
                  >
                    {/* EDIT MODE */}
                    {editingId === msg.id ? (
                      <div className="flex flex-col gap-1">

                        {/* INLINE EDIT TEXTAREA */}
                        <Textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                        className={cn(
                          "w-full resize-none bg-transparent p-0 text-sm",
                          "border-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none",
                          isOwn ? "text-white placeholder:text-white/60" : "text-black"
                        )}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleEdit(msg.id)
                          }

                          if (e.key === "Escape") {
                            setEditingId(null)
                          }
                        }}
                      />

                        {/* INLINE ACTIONS */}
                        <div className="flex justify-end gap-2 text-[11px] mt-1">
                          <button
                            onClick={() => handleEdit(msg.id)}
                            className="text-green-500 hover:underline"
                          >
                            ✔
                          </button>

                          <button
                            onClick={() => setEditingId(null)}
                            className="text-red-400 hover:underline"
                          >
                            ✖ 
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.content && (
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        )}

                        {/* PREVIEW BEFORE UPLOAD */}
                        {msg.localPreview && (
                          <img
                            src={msg.localPreview}
                            className="mt-2 rounded-md max-h-60 opacity-80"
                          />
                        )}

                        {/* REAL IMAGE */}
                        {msg.image_url && msg.image_type === "image" && (
                          <img
                            src={msg.image_url}
                            className="mt-2 rounded-md max-h-60"
                          />
                        )}

                        {/* PDF */}
                        {msg.image_type === "pdf" && (
                          <a href={msg.image_url} className="text-xs underline">
                            📄 View PDF
                          </a>
                        )}

                        {/* STATUS */}
                        {msg.status === "sending" && (
                          <p className="text-[10px] opacity-70 mt-1">
                            Sending...
                          </p>
                        )}

                        {msg.status === "failed" && (
                          <p className="text-[10px] text-red-500 mt-1">
                            Failed
                          </p>
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

      {/* INPUT */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">

          <EmojiPickerButton onSelect={(e) => setContent((p) => p + e)} />

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
          className="flex-1 min-h-[50px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />

          <Button onClick={handleSend} size="icon">
            {sending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
          </Button>
        </div>

        {/* FILE PREVIEW */}
        {file && (
          <div className="mt-2 flex justify-between text-xs bg-muted border px-2 py-1 rounded shadow-sm">
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
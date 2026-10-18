import { useEffect, useState, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, Paperclip, Send } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { directMessagesService } from "@/services/directMessagesService"
import { useMessagingStore } from "@/stores/messagingStore"
import { useToast } from "@/hooks/use-toast"
import { compressImage } from "@/lib/utils"
import { ALLOWED_MIME, MAX_SIZE, uploadFile, validateUploadFile } from "@/lib/uploadUtils"
import EmojiPickerButton from "../EmojiPicker"

interface RecipientInputProps {
  onStartChat: (user: UserListItem) => void
}

interface UserListItem {
  id: string
  name?: string
  avatar?: string
 
}

export default function RecipientInput({
  onStartChat,
}: RecipientInputProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const currentUserId = user?.id

  const addMessageToStore = useMessagingStore((s) => s.addMessage)

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserListItem[]>([])
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)

  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)



  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CLOSE DROPDOWN
  const fetchUsers = useCallback(async (search: string) => {
    if (!currentUserId) return

    setLoading(true)

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar")
      .ilike("full_name", `%${search}%`)
      .neq("id", currentUserId)
      .limit(10)

    if (data) {
      const users = data.map((u) => ({
        id: u.id,
        name: u.full_name,
        avatar: u.avatar,
      }))

      setResults(users)
      setOpen(users.length > 0)
    }

    setLoading(false)
  }, [currentUserId])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // SEARCH USERS
  useEffect(() => {
  if (selectedUser) return

  const timeout = setTimeout(() => {
    if (!query.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    fetchUsers(query)
  }, 300)

  return () => clearTimeout(timeout)
}, [query, selectedUser, fetchUsers])

 const handleSelectUser = (user: UserListItem) => {
  setSelectedUser(user)
  setQuery(user.name || "")
  setResults([])
  setOpen(false)
}

  // SEND MESSAGE
  const handleStart = async () => {
    if (!selectedUser || !currentUserId) return

    setCreating(true)

    try {
      let image_url: string | undefined
      let image_type: "image" | "pdf" | null = null

      if (file) {
        let fileToUpload = file

        if (file.type.startsWith("image/")) {
          try {
            fileToUpload = await compressImage(file)
          } catch (error) {
            console.warn("[Messaging] Image compression failed; uploading original file:", error)
          }
        }

        const uploadPath = `chat/${currentUserId}-${Date.now()}.${file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "file"}`
        const uploaded = await uploadFile(fileToUpload, {
          bucket: "uploads",
          filePath: uploadPath,
          allowedMimeTypes: ALLOWED_MIME.chatAttachment,
          maxSizeBytes: MAX_SIZE.chatAttachment,
          context: "direct message attachment",
        })

        if (uploaded.error || !uploaded.url) {
          toast({
            title: "Attachment upload failed",
            description: uploaded.error || "Please try a different file.",
            variant: "destructive",
          })
          setCreating(false)
          return
        }

        image_url = uploaded.url
        image_type = file.type.startsWith("image") ? "image" : "pdf"
      }

      if (message.trim() || image_url) {
        const { data, error } = await directMessagesService.sendMessage({
          sender_id: currentUserId,
          recipient_id: selectedUser.id,
          content: message.trim(),
          image_url,
          image_type,
          
        })

        if (error) throw error
        if (data) addMessageToStore(data)
      }

      await onStartChat(selectedUser)

      setMessage("")
      setQuery("")
      setSelectedUser(null)
      setResults([])
      setOpen(false)
      setFile(null)
      

      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err: unknown) {
      toast({
        title: "Send failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    }

    setCreating(false)
  }

  // CANCEL DRAFT
  const handleCancel = () => {
    setMessage("")
    setFile(null)

    if (fileInputRef.current) fileInputRef.current.value = ""

    toast({
      title: "Cleared",
      description: "Message draft removed",
    })
  }

  return (
    <div
      ref={wrapperRef}
      className="h-full w-full max-w-md space-y-4 overflow-y-auto rounded-xl bg-card p-4"
    >
      <h2 className="text-center text-lg font-semibold">
        Create New Message
      </h2>

      {/* RECIPIENT */}
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          <h2>To:</h2>
        </label>

        <div className="relative">
          <Input
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            name="recipient-search"
            placeholder="Add User..."
            value={query}
            onChange={(e) => {
              const value = e.target.value

              setQuery(value)

              if (selectedUser) {
                setSelectedUser(null)
              }

              setOpen(value.trim().length > 0)
            }}
          />

          {open && (
            <div className="
            absolute
            top-full
            left-0
            right-0
            z-50
            mt-2
            max-h-72
            overflow-y-auto
            rounded-xl
            border
            border-border
            bg-background/95
            backdrop-blur-md
            shadow-xl
            ">
              {loading && (
                <div className="flex justify-center p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}

              {!loading && results.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">
                  No users found
                </div>
              )}

              {!loading &&
                results.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex w-full items-center gap-3 px-3 py-2 hover:bg-muted"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.avatar ?? ""} />
                      <AvatarFallback>
                        {user.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

     

      {/* MESSAGE — fixed: bg-card + text-foreground for dark mode */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="min-h-[100px] w-full resize-none rounded-md border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* ACTION BAR */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2">

        {/* LEFT */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <EmojiPickerButton
            onSelect={(emoji) => setMessage((prev) => prev + emoji)}
          />

          {/* ATTACH */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card transition hover:bg-muted"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* FILE PREVIEW */}
          {file && (
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs shadow-sm">
              <span className="truncate text-foreground">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="shrink-0 text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {/* FILE INPUT */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            onChange={(e) => {
              const selected = e.target.files?.[0]
              if (!selected) return
              const validation = validateUploadFile(
                selected,
                ALLOWED_MIME.chatAttachment,
                MAX_SIZE.chatAttachment,
              )
              if (!validation.valid) {
                toast({
                  title: "Attachment not accepted",
                  description: validation.error || "Choose an image or PDF up to 10 MB.",
                  variant: "destructive",
                })
                e.target.value = ""
                return
              }
              setFile(selected)
              toast({
                title: "File attached",
                description: selected.name,
              })
            }}
          />
        </div>

        {/* RIGHT */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={creating}
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            size="icon"
            disabled={!selectedUser || creating}
            onClick={handleStart}
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState, useRef } from "react"
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
import EmojiPickerButton from "../EmojiPicker"

interface RecipientInputProps {
  onStartChat: (user: UserListItem) => void
  
}

interface UserListItem {
  id: string
  name?: string
  avatar?: string
  category?: "general" | "interests" | "submissions"
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
  const [selectedUser, setSelectedUser] =
    useState<UserListItem | null>(null)

  const [message, setMessage] = useState("")
  const [file, setFile] = useState<File | null>(null)

  // NEW CATEGORY STATE
  const [category, setCategory] = useState<
    "general" | "interests" | "submissions"
  >("general")

  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CLOSE DROPDOWN
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () =>
      document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // SEARCH USERS
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!query.trim()) {
        setResults([])
        return
      }

      fetchUsers(query)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const fetchUsers = async (search: string) => {
    if (!currentUserId) return

    setLoading(true)

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, avatar")
      .ilike("full_name", `%${search}%`)
      .neq("id", currentUserId)
      .limit(10)

    if (data) {
      setResults(
        data.map((u) => ({
          id: u.id,
          name: u.full_name,
          avatar: u.avatar,
        }))
      )

      setOpen(true)
    }

    setLoading(false)
  }

  const handleSelectUser = (user: UserListItem) => {
    setSelectedUser(user)
    setQuery(user.name || "")
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

        // COMPRESS IMAGES
        if (file.type.startsWith("image/")) {
          try {
            fileToUpload = await compressImage(file)
          } catch {}
        }

        // SIZE LIMIT
        if (fileToUpload.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Max size is 10MB",
            variant: "destructive",
          })

          setCreating(false)
          return
        }

        const fileExt = file.name.split(".").pop()

        const fileName = `${currentUserId}-${Date.now()}.${fileExt}`

        const filePath = `chat/${fileName}`

        const { error } = await supabase.storage
          .from("uploads")
          .upload(filePath, fileToUpload, {
            contentType: fileToUpload.type,
          })

        if (error) throw error

        const { data } = supabase.storage
          .from("uploads")
          .getPublicUrl(filePath)

        image_url = data.publicUrl

        image_type = file.type.startsWith("image")
          ? "image"
          : "pdf"
      }

      // SEND
      if (message.trim() || image_url) {
        const { data, error } =
          await directMessagesService.sendMessage({
            sender_id: currentUserId,
            recipient_id: selectedUser.id,
            content: message.trim(),
            image_url,
            image_type,

            // NEW CATEGORY
            category,
          })

        if (error) throw error

        if (data) {
          addMessageToStore(data)
        }
      }

      await onStartChat(selectedUser)

      // RESET
      setMessage("")
      setQuery("")
      setSelectedUser(null)
      setFile(null)
      setCategory("general")

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: any) {
      toast({
        title: "Send failed",
        description: err.message,
        variant: "destructive",
      })
    }

    setCreating(false)
  }

  // CANCEL DRAFT
  const handleCancel = () => {
    setMessage("")
    setFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    toast({
      title: "Cleared",
      description: "Message draft removed",
    })
  }

  return (
    <div
      ref={wrapperRef}
      className="w-full max-w-md space-y-4 rounded-xl border bg-card p-4 shadow-sm"
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
            placeholder="Search user..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedUser(null)
            }}
            onFocus={() => query && setOpen(true)}
          />

          {open && (
            <div className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
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
                      <AvatarImage
                        src={user.avatar ?? ""}
                      />

                      <AvatarFallback>
                        {user.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <span className="text-sm">
                      {user.name}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* CATEGORY SELECTOR */}
      <div className="flex items-center gap-2">
        {["general", "interests", "submissions"].map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setCategory(
                  item as
                    | "general"
                    | "interests"
                    | "submissions"
                )
              }
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition capitalize
              ${
                category === item
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* MESSAGE */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="min-h-[100px] w-full resize-none rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* ACTION BAR */}
      <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 px-3 py-2">

        {/* LEFT */}
        <div className="flex min-w-0 flex-1 items-center gap-2">

          <EmojiPickerButton
            onSelect={(emoji) =>
              setMessage((prev) => prev + emoji)
            }
          />

          {/* ATTACH */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background transition hover:bg-muted"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* FILE PREVIEW */}
          {file && (
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs shadow-sm">
              <span className="truncate text-foreground">
                {file.name}
              </span>

              <button
                type="button"
                onClick={() => {
                  setFile(null)

                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
                className="shrink-0 text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {/* SINGLE FILE INPUT */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const selected =
                e.target.files?.[0]

              if (!selected) return

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

          {/* CANCEL */}
          <Button
            type="button"
            variant="outline"
            disabled={creating}
            onClick={handleCancel}
          >
            Cancel
          </Button>

          {/* SEND */}
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
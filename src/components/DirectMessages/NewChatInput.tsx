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
}

export default function RecipientInput({ onStartChat }: RecipientInputProps) {
  const { user } = useAuth()
  const currentUserId = user?.id

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserListItem[]>([])
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ✅ Debounced search
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

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar")
      .ilike("full_name", `%${search}%`)
      .neq("id", currentUserId)
      .limit(10)

    if (!error && data) {
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

  const handleStart = async () => {
    if (!selectedUser) return

    setCreating(true)
    await onStartChat(selectedUser)
    setCreating(false)
  }

  return (
    <div ref={wrapperRef} className="flex w-full flex-col gap-4 p-2">
      
      {/* SEARCH INPUT */}
      <div className="relative w-full">
        <Input
          placeholder="Search connections..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedUser(null)
          }}
          onFocus={() => query && setOpen(true)}
        />

        {/* DROPDOWN */}
        {open && (
          <div className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-lg border bg-background shadow-lg">
            
            {/* LOADING */}
            {loading && (
              <div className="flex justify-center p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}

            {/* EMPTY */}
            {!loading && results.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">
                No users found
              </div>
            )}

            {/* RESULTS */}
            {!loading &&
              results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar ?? ""} />
                    <AvatarFallback>
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <span className="text-sm font-medium">
                    {user.name}
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {/* SELECTED USER PREVIEW */}
      {selectedUser && (
        <div className="flex items-center gap-3 rounded-md border p-2 bg-muted/40">
          <Avatar className="h-8 w-8">
            <AvatarImage src={selectedUser.avatar ?? ""} />
            <AvatarFallback>
              {selectedUser.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>

          <span className="text-sm font-medium">
            {selectedUser.name}
          </span>
        </div>
      )}

      {/* START CHAT */}
      <Button
        disabled={!selectedUser || creating}
        onClick={handleStart}
        className="w-full"
      >
        {creating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Start Chat"
        )}
      </Button>
    </div>
  )
}
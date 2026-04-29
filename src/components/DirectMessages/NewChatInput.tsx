import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

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
  <div ref={wrapperRef} className="flex flex-col gap-4 p-4">

    {/* TITLE */}
    <h2 className="text-center text-lg font-semibold">
      Create New Message
    </h2>

    {/* RECIPIENT */}
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">Recipient</label>

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

        {/* DROPDOWN */}
        {open && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-md border bg-white shadow-md">
            
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
                  className="flex w-full items-center gap-3 p-3 hover:bg-muted text-left"
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

    {/* MESSAGE */}
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">Message</label>

      <textarea
        className="min-h-[120px] w-full resize-none rounded-md border p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type your message..."
      />
    </div>

    {/* ACTIONS */}
    <div className="flex items-center justify-between pt-2">

      {/* LEFT: ATTACH */}
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
        +
      </button>

      {/* RIGHT: BUTTONS */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setQuery("")
            setSelectedUser(null)
          }}
        >
          Cancel
        </Button>

        <Button
          disabled={!selectedUser}
          onClick={handleStart}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Send"
          )}
        </Button>
      </div>
    </div>
  </div>
)
}
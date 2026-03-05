import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface RecipientInputProps {
	onStartChat: (user) => void
}

interface UserListItem {
	id: string
	name?: string
	avatar?: string
}

export default function RecipientInput({ onStartChat }: RecipientInputProps) {
	const [query, setQuery] = useState("")
	const {
		user: { id: currentUserId },
	} = useAuth()
	const [results, setResults] = useState([])
	const [selectedUser, setSelectedUser] = useState(null)
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [creating, setCreating] = useState(false)
	const [click, setClick] = useState(false)
	const [chat, setChat] = useState(false)

	// 🔥 Debounce search
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

	const handleSelectUser = (user: UserListItem) => {
		setSelectedUser(user)
	}

	const fetchUsers = async (search: string) => {
		setLoading(true)

		const { data, error } = await supabase.from("profiles").select("id, full_name, avatar").ilike("full_name", `%${search}%`).neq("id", currentUserId).limit(10)

		if (!error && data) {
			setResults(data)
			setOpen(true)
		}

		setLoading(false)
	}

	const handleStart = async () => {
		if (!selectedUser) return
		setCreating(true)

		await onStartChat(selectedUser)

		setCreating(false)
	}

	console.log({ selectedUser, query,open })

	return (
		<div className="flex w-full flex-col gap-4 p-2">
			<div className="relative w-full">
				<Input
					placeholder="Search user..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value)
						// setSelectedUser(null)
						setClick(false)
					}}
					onFocus={() => query && setOpen(true)}
					// onBlur={() => setOpen(false)}
				/>

				{open && !click && (
					<div className="absolute left-0 right-0 z-[99999] mt-2 rounded-lg border bg-background shadow-md">
						{loading && <div className="m-2 mx-auto h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />}

						{!loading && results.length === 0 && <div className="p-3 text-sm text-muted-foreground">No users found</div>}

						{!loading &&
							results.map(({ id, full_name, avatar }) => (
								<button
									key={id}
									onClick={() => {
										setSelectedUser({
											id,
											name: full_name || undefined,
											avatar: avatar || undefined,
										})

										setQuery(full_name)
										setOpen(false)
										setClick(true)
									}}
									className="flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted">
									<Avatar className="h-8 w-8">
										<AvatarImage src={avatar ?? ""} />
										<AvatarFallback>{full_name[0].toUpperCase()}</AvatarFallback>
									</Avatar>

									<span className="text-sm font-medium">{full_name}</span>
								</button>
							))}
					</div>
				)}
			</div>

			{/* 🔥 Start Chat Button */}
			<Button
				disabled={!selectedUser || creating}
				onClick={handleStart}
				className="w-full">
				{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Chat"}
			</Button>
		</div>
	)
}

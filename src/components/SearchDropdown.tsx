import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { searchService, SearchResult, SearchFilters } from "@/services/searchService"

const DEBOUNCE_MS = 350

export default function SearchDropdown() {
	const [activeTab, setActiveTab] = useState("people")
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [posts, setPosts] = useState<any[]>([])
	const [opportunity, setOpportunity] = useState<any[]>([])
	const [skills, setSkills] = useState<any[]>([])
	const [profiles, setProfiles] = useState<SearchResult[]>([])
	const [query, setQuery] = useState("")
	const inputRef = useRef<HTMLInputElement | null>(null)

	const navigate = useNavigate()

	const debouncedSearch = useCallback(
		searchService.debounce(async (q: string) => {
			if (q.trim().length < 2) {
				setProfiles([])
				setPosts([])
				return
			}
			setLoading(true)
			const [{ data: people, error: peopleError }, { data: postData, error: postsError }] = await Promise.all([searchService.searchProfiles(q, {} as SearchFilters), searchService.searchPosts(q)])

			if (!peopleError) setProfiles((people || []).slice(0, 5))
			if (!postsError) setPosts((postData || []).slice(0, 5))
			setLoading(false)
		}, DEBOUNCE_MS),
		[],
	)

	useEffect(() => {
		if (open) debouncedSearch(query)
	}, [query, open, debouncedSearch])

	useEffect(() => {
		if (profiles.length > 0) {
			setActiveTab("people")
		} else if (posts.length > 0) {
			setActiveTab("content")
		} else if (skills.length > 0) {
			setActiveTab("skills")
		} else if (opportunity.length > 0) {
			setActiveTab("opportunity")
		}
	}, [profiles, posts, skills, opportunity])

	const clear = () => {
		setQuery("")
		setProfiles([])
		setPosts([])
		setOpen(true)
	}

	const seeAll = () => {
		if (!query.trim()) return
		navigate(`/search?q=${encodeURIComponent(query.trim())}`)
		setOpen(false)
	}

	return (
		<>
			{open && (
				<div
					className="fixed inset-0 z-40 mt-12 h-screen bg-black/70"
					onClick={() => setOpen(false)}
				/>
			)}
			<Popover
				open={open}
				onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<div
						className="relative w-full"
						onMouseDown={(e) => {
							// Ensure first tap focuses input and keeps popover open
							e.preventDefault()
							inputRef.current?.focus()
							setOpen(true)
						}}>
						<Input
							placeholder="Search users, skills, or content..."
							value={query}
							onChange={(e) => {
								setQuery(e.target.value)
								setOpen(true)
							}}
							onFocus={() => setOpen(true)}
							ref={inputRef}
							onClick={() => setOpen(true)}
							className="pl-9 pr-16"
						/>
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						{query && (
							<Button
								variant="ghost"
								size="sm"
								className="absolute right-10 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
								onClick={clear}>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</PopoverTrigger>

				<PopoverContent
					className="z-50 w-[min(var(--radix-popover-trigger-width),28rem)] p-0 shadow-lg"
					align="start"
					onOpenAutoFocus={(e) => e.preventDefault()}
					onCloseAutoFocus={(e) => e.preventDefault()}>
					<div className="max-h-[420px] w-full max-w-md overflow-y-auto">
						{loading && (
							<div className="flex w-full max-w-md items-center justify-center p-4 text-sm text-muted-foreground">
								<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
								Searching…
							</div>
						)}

						{!loading && profiles.length === 0 && posts.length === 0 && query.trim().length >= 2 ? (
							<div className="p-4 text-sm text-muted-foreground">No results found</div>
						) : (
							<>
								{/* Tabs Header */}
								<div className="flex w-full max-w-md border-b bg-muted/30">
									<button
										onClick={() => setActiveTab("people")}
										className={`flex-1 px-2 py-2 text-xs font-medium transition ${activeTab === "people" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
										People ({profiles.length})
									</button>

									<button
										onClick={() => setActiveTab("content")}
										className={`flex-1 px-2 py-2 text-xs font-medium transition ${activeTab === "content" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
										Content ({posts.length})
									</button>

									<button
										onClick={() => setActiveTab("skills")}
										className={`flex-1 px-2 py-2 text-xs font-medium transition ${activeTab === "skills" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
										Skills ({skills.length})
									</button>

									<button
										onClick={() => setActiveTab("opportunity")}
										className={`flex-1 px-2 py-2 text-xs font-medium transition ${activeTab === "opportunity" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
										Opportunity ({opportunity.length})
									</button>
								</div>

								{/* Tab body */}
								<div className="divide-y">
									{activeTab === "people" ? (
										<>
											{posts.length === 0 && query.length >= 2 && <div className="p-4 text-sm text-muted-foreground">No people found</div>}
											{profiles.map((p) => (
												<button
													key={p.id}
													className="group flex w-full items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-accent hover:text-accent-foreground"
													onClick={() => {
														navigate(`/profile/${p.id}`)
														setOpen(false)
													}}>
													<Avatar className="h-9 w-9">
														<AvatarImage src={p.avatar || undefined} />
														<AvatarFallback className="group-hover:text-foreground">{p.full_name?.[0] || "U"}</AvatarFallback>
													</Avatar>
													<div className="min-w-0 flex-1">
														<div className="flex items-center gap-2">
															<span className="truncate text-sm font-medium group-hover:text-accent-foreground">{p.full_name || "Unknown"}</span>
															<Badge
																variant="outline"
																className="text-[10px] group-hover:border-accent-foreground group-hover:text-accent-foreground">
																{p.user_type}
															</Badge>
														</div>
														<p className="truncate text-xs text-muted-foreground group-hover:text-accent-foreground">{p.profession || p.title || "No profession"}</p>
														{p.skills && p.skills.length > 0 && (
															<div className="mt-1 flex flex-wrap gap-1">
																{p.skills.slice(0, 2).map((s, i) => (
																	<Badge
																		key={i}
																		variant="secondary"
																		className="text-[10px]">
																		{s}
																	</Badge>
																))}
																{p.skills.length > 2 && (
																	<Badge
																		variant="secondary"
																		className="text-[10px]">
																		+{p.skills.length - 2}
																	</Badge>
																)}
															</div>
														)}
													</div>
												</button>
											))}
										</>
									) : activeTab === "content" ? (
										<>
											{posts.length === 0 && query.length >= 2 && <div className="p-4 text-sm text-muted-foreground">No content found</div>}
											{posts.map((post) => (
												<button
													key={post.id}
													className="flex w-full items-center gap-3 px-4 py-3 text-left text-foreground hover:bg-accent hover:text-accent-foreground"
													onClick={() => {
														// Adjust when a post detail route exists
														setOpen(false)
													}}>
													<div className="min-w-0 flex-1">
														<p className="line-clamp-2 text-sm font-medium">{post.content}</p>
														<p className="truncate text-xs text-muted-foreground">
															{post.profiles?.full_name || "Unknown"} • {new Date(post.created_at).toLocaleDateString()}
														</p>
													</div>
												</button>
											))}
										</>
									) : activeTab === "skills" ? (
										<>
											{skills.length === 0 && query.length >= 2 && <div className="p-4 text-sm text-muted-foreground">No skills found</div>}
											{skills.map((skill, i) => (
												<button
													key={i}
													className="w-full px-4 py-3 text-left hover:bg-accent"
													onClick={() => setOpen(false)}>
													{skill.name || skill}
												</button>
											))}
										</>
									) : activeTab === "opportunity" ? (
										<>
											{opportunity.length === 0 && query.length >= 2 && <div className="p-4 text-sm text-muted-foreground">No opportunities found</div>}
											{opportunity.map((opp, i) => (
												<button
													key={i}
													className="w-full px-4 py-3 text-left hover:bg-accent"
													onClick={() => setOpen(false)}>
													{opp.title || "Untitled opportunity"}
												</button>
											))}
										</>
									) : null}
								</div>
							</>
						)}
					</div>

					{/* See all results link */}
					{query.trim().length >= 2 && (profiles.length > 0 || posts.length > 0) && (
						<div className="flex justify-end border-t px-3 py-2">
							<Button
								variant="link"
								size="sm"
								className="px-0 text-xs"
								onClick={() => seeAll()}>
								See all results
							</Button>
						</div>
					)}
				</PopoverContent>
			</Popover>
		</>
	)
}

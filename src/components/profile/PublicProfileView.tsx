import React, { useState, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, UserPlus, Briefcase, GraduationCap, Globe2, Plus, Pencil, MoreHorizontal } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { publicProfileService } from "@/services/publicProfileService"
import { useToast } from "@/hooks/use-toast"
import SocialMediaLinks from "./SocialMediaLinks"
import { profileService } from "@/services/profileService"
import { Education, UserProfile } from "@/types"
import { connectionsService } from "@/services/connectionsService"
import { postsService } from "@/services/postsService"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import ProfileAbout from "@/components/feeds/ProfileAbout"
import ProfileActivity from "@/components/feeds/ProfileActivity"
import PortfolioSection from "@/components/profile-sections/details/PortfolioSection"
import ExperienceSection from "@/components/profile-sections/details/ExperienceSection"
import EducationSection from "@/components/profile-sections/details/EducationSection"
import CertificationsSection from "@/components/profile-sections/details/CertificationsSection"
import CompactSkillsSection from "@/components/profile-sections/details/CompactSkillsSection"
import AccountTypeBadge from "@/components/AccountTypeBadge"

type ConnectionStatus =
	| "not_connected"
	| "pending_outgoing"
	| "pending_incoming"
	| "connected"
	| "self"

type Mode = "edit" | "view"

type SectionProps = {
	title: string
	badge?: string
	subTitle?: string
	optional?: boolean
	mode: Mode
	onEdit?: () => void
	onAdd?: () => void
	children: React.ReactNode
}

const SectionCard = ({ title, badge, subTitle, optional, mode, onEdit, onAdd, children }: SectionProps) => (
	<Card>
		<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
			<div>
				<div className="flex items-center gap-2">
					<CardTitle className="text-base font-semibold">{title}</CardTitle>
					{badge && <Badge variant="secondary" className="text-[11px]">{badge}</Badge>}
					{optional && <span className="text-xs text-muted-foreground">(optional)</span>}
				</div>
				{subTitle && <p className="text-sm text-muted-foreground mt-1">{subTitle}</p>}
			</div>
			{mode === "edit" && (onEdit || onAdd) && (
				<div className="flex items-center gap-2">
					{onAdd && (
						<Button size="sm" variant="outline" onClick={onAdd} className="h-8">
							<Plus className="h-4 w-4 mr-1" />
							Add
						</Button>
					)}
					{onEdit && (
						<Button size="sm" variant="ghost" onClick={onEdit} className="h-8">
							<Pencil className="h-4 w-4 mr-1" />
							Edit
						</Button>
					)}
				</div>
			)}
		</CardHeader>
		<CardContent>{children}</CardContent>
	</Card>
)

const ReadMoreText = ({ text, initialLines = 4 }: { text: string; initialLines?: number }) => {
	const [expanded, setExpanded] = useState(false)
	if (!text) return <p className="text-muted-foreground">No information provided yet.</p>
	return (
		<div className="space-y-2">
			<p className={expanded ? "" : `line-clamp-${initialLines}`}>{text}</p>
			{text.length > 160 && (
				<Button variant="link" className="p-0 h-auto text-sm" onClick={() => setExpanded((v) => !v)}>
					{expanded ? "Show less" : "Read more"}
				</Button>
			)}
		</div>
	)
}

const TagList = ({ items }: { items: string[] }) => {
	if (!items?.length) return <p className="text-sm text-muted-foreground">No items added yet.</p>
	return (
		<div className="flex flex-wrap gap-2">
			{items.map((item, idx) => (
				<Badge key={`${item}-${idx}`} variant="secondary" className="capitalize">
					{item}
				</Badge>
			))}
		</div>
	)
}

const ItemGrid = ({
	items,
	mode,
	ctaLabel = "+ Add",
	onAdd,
}: {
	items: { title?: string; description?: string; url?: string }[]
	mode: Mode
	ctaLabel?: string
	onAdd?: () => void
}) => {
	const displayItems = items.slice(0, 3)
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{displayItems.map((item, idx) => (
				<Card key={`${item.title}-${idx}`} className="hover:border-primary/50 transition-colors cursor-pointer">
					<CardContent className="p-4 space-y-2">
						<h4 className="font-semibold">{item.title || "Untitled"}</h4>
						<p className="text-sm text-muted-foreground line-clamp-3">{item.description || "No description"}</p>
						{item.url && (
							<Button variant="link" className="p-0 h-auto text-sm" onClick={() => window.open(item.url, "_blank")}>
								View details
							</Button>
						)}
					</CardContent>
				</Card>
			))}
			{mode === "edit" && (
				<button
					type="button"
					onClick={onAdd}
					className="flex h-full min-h-[140px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 text-sm text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
				>
					{ctaLabel}
				</button>
			)}
		</div>
	)
}

const PreviewList = ({
	title,
	items,
	mode,
	onMore,
	onAdd,
}: {
	title: string
	items: { name?: string; role?: string; avatar?: string }[]
	mode: Mode
	onMore?: () => void
	onAdd?: () => void
}) => (
	<div className="space-y-3">
		<div className="flex items-center justify-between">
			<h4 className="text-sm font-semibold">{title}</h4>
			<div className="flex gap-2">
				{onMore && (
					<Button size="sm" variant="ghost" className="h-8" onClick={onMore}>
						<MoreHorizontal className="h-4 w-4 mr-1" />
						More
					</Button>
				)}
				{mode === "edit" && onAdd && (
					<Button size="sm" variant="outline" className="h-8" onClick={onAdd}>
						<Plus className="h-4 w-4 mr-1" />
						Add
					</Button>
				)}
			</div>
		</div>
		{items?.length ? (
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{items.slice(0, 6).map((item, idx) => (
					<div key={`${item.name}-${idx}`} className="flex items-center gap-3 rounded-md border p-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={item.avatar} />
							<AvatarFallback>{item.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="text-sm font-medium truncate">{item.name || "Unknown"}</p>
							<p className="text-xs text-muted-foreground truncate">{item.role || "—"}</p>
						</div>
					</div>
				))}
			</div>
		) : (
			<p className="text-sm text-muted-foreground">No entries yet.</p>
		)}
	</div>
)

const calculateProfileCompletion = (profile: UserProfile) => {
	let score = 0
	const add = (condition: boolean, weight: number) => {
		if (condition) score += weight
	}
	add(!!profile.bio, 15)
	add(!!profile.skills?.length, 10)
	add(!!profile.education?.length, 15)
	// experiences are stored differently on each subtype; use loose access
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const anyProfile = profile as any
	add(!!anyProfile.experience?.length || !!anyProfile.experiences?.length, 15)
	add((profile as any)?.portfolio?.length > 0 || (profile as any)?.products?.length > 0, 15)
	add(!!profile.social_links && Object.keys(profile.social_links).length > 0, 10)
	add(!!profile.languages?.length, 5)
	add(!!(profile as any).certifications?.length, 5)
	// connections only exist on some subtypes
	add(!!(profile as any).connections?.length || (profile as any)?.people?.length, 10)
	return Math.min(100, score)
}

const PublicProfileView: React.FC = () => {
	const { profileId } = useParams<{ profileId: string }>()
	const { user } = useAuth()
	const { toast } = useToast()
	const [profile, setProfile] = useState<UserProfile | null>()
	const [loading, setLoading] = useState(true)
	const [viewRecorded, setViewRecorded] = useState(false)
	const [connectionRow, setConnectionRow] = useState<any | null>(null)
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("not_connected")
	const [userPosts, setUserPosts] = useState<any[]>([])

	const isOwner = user?.id === profileId
	const mode: Mode = isOwner ? "edit" : "view"

	const student = profile?.user_type === "student"
	const professional = profile?.user_type === "professional"
	const company = profile?.user_type === "company"

	useEffect(() => {
		if (profileId) {
			if (isOwner) loadCurrentUser()
			else loadPublicProfile()
		}
	}, [profileId, isOwner])

	const loadPublicProfile = async () => {
		if (!profileId) return

		try {
			const { data, error } = await publicProfileService.getPublicProfile(profileId, user?.id)

			if (error) {
				toast({
					title: "Error",
					description: "Failed to load profile or profile is not public",
					variant: "destructive",
				})
				return
			}

			setProfile(data)
			
			// Load posts for this user
			try {
				const postsResult = await postsService.getPosts()
				if (postsResult.data) {
					const filteredPosts = postsResult.data.filter((post: any) => post.author_id === profileId)
					setUserPosts(filteredPosts)
				}
			} catch (error) {
				console.error("Error loading posts:", error)
			}

			if (user && user.id !== profileId && !viewRecorded) {
				await publicProfileService.recordProfileView(profileId)
				setViewRecorded(true)
			}
		} catch (error) {
			console.error("Error loading public profile:", error)
		} finally {
			setLoading(false)
		}
	}

	const loadCurrentUser = async () => {
		if (!user?.id) return

		try {
			const [profileResult, postsResult] = await Promise.all([
				profileService.getProfile(user.id),
				postsService.getPosts()
			])

			if (profileResult.error) {
				toast({
					title: "Error",
					description: "Failed to load profile or user does not exist",
					variant: "destructive",
				})
				return
			}

			setProfile(profileResult.data)
			
			// Filter posts for this user
			if (postsResult.data) {
				const filteredPosts = postsResult.data.filter((post: any) => post.author_id === user.id)
				setUserPosts(filteredPosts)
			}
		} catch (error) {
			console.error("Error loading public profile:", error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const fetchConnectionStatus = async () => {
			if (!user?.id || !profileId) {
				setConnectionStatus("not_connected")
				setConnectionRow(null)
				return
			}

			if (user.id === profileId) {
				setConnectionStatus("self")
				setConnectionRow(null)
				return
			}

			const { data, error } = await connectionsService.getConnectionStatus(user.id, profileId)

			if (error) {
				console.error("Error fetching connection status:", error)
				setConnectionStatus("not_connected")
				setConnectionRow(null)
				return
			}

			if (!data) {
				setConnectionStatus("not_connected")
				setConnectionRow(null)
				return
			}

			setConnectionRow(data)

			if (data.status === "accepted") {
				setConnectionStatus("connected")
			} else if (data.status === "pending") {
				if (data.user_id === user.id) {
					setConnectionStatus("pending_outgoing")
				} else if (data.connected_user_id === user.id) {
					setConnectionStatus("pending_incoming")
				} else {
					setConnectionStatus("not_connected")
				}
			} else {
				setConnectionStatus("not_connected")
			}
		}

		fetchConnectionStatus()
	}, [user, profileId])

	const handleConnect = async () => {
		if (!user?.id || !profileId) {
			toast({
				title: "Error",
				description: "You must be logged in to send connection requests.",
				variant: "destructive",
			})
			return
		}

		if (connectionStatus === "pending_outgoing" || connectionStatus === "connected") {
			toast({
				title: "Info",
				description: "Connection request already sent or already connected.",
				variant: "default",
			})
			return
		}

		const { data, error } = await connectionsService.connect(user.id, profileId)

		if (error) {
			toast({
				title: "Error",
				description: "Failed to send connection request.",
				variant: "destructive",
			})
			console.error("Error sending connection request:", error)
			return
		}

		setConnectionRow(data)
		setConnectionStatus("pending_outgoing")
		toast({
			title: "Success",
			description: "Connection request sent!",
		})
	}

	const handleAccept = async () => {
		if (!connectionRow?.id) {
			toast({ title: "Error", description: "No connection request to accept.", variant: "destructive" })
			return
		}

		const { data, error } = await connectionsService.acceptRequest(connectionRow.id)
		if (error) {
			console.error("Error accepting request:", error)
			toast({ title: "Error", description: "Failed to accept request.", variant: "destructive" })
			return
		}

		setConnectionRow(data)
		setConnectionStatus("connected")
		toast({ title: "Success", description: "Connection accepted." })
	}

	const renderConnectButtons = () => {
		if (!user || connectionStatus === "self") return null

		const messageButton = (
			<Button
				variant="outline"
				onClick={() => {
					if (connectionStatus !== "connected") {
						toast({ title: "Info", description: "Connect first to send messages", variant: "default" })
						return
					}
					toast({ title: "Info", description: "Messaging coming soon!", variant: "default" })
				}}
				className={connectionStatus !== "connected" ? "opacity-60 cursor-not-allowed" : ""}
			>
				<MessageCircle className="mr-2 h-4 w-4" />
				Message
			</Button>
		)

		if (connectionStatus === "connected") {
			return (
				<>
					<Button variant="outline" disabled>
						Connected
					</Button>
					{messageButton}
				</>
			)
		}

		if (connectionStatus === "pending_outgoing") {
			return (
				<>
					<Button disabled>Pending</Button>
					{messageButton}
				</>
			)
		}

		if (connectionStatus === "pending_incoming") {
			return (
				<>
					<Button onClick={handleAccept}>Accept</Button>
					{messageButton}
				</>
			)
		}

		return (
			<>
				<Button onClick={handleConnect}>
					<UserPlus className="mr-2 h-4 w-4" />
					Connect
				</Button>
				{messageButton}
			</>
		)
	}

	const portfolioItems = (profile as any)?.portfolio || []
	const featuredItems = (profile as any)?.featured || (profile as any)?.products || []
	// unify experience for different profile subtypes
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const experienceItems = (profile as any)?.experience || (profile as any)?.experiences || []
	const certificationItems = (profile as any)?.certifications || (profile as any)?.Certification || []
	// connections only exist on some subtypes
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const connections = (profile as any)?.connections || []
	const people = (profile as any)?.people || []
	const following = (profile as any)?.following || []
	const interests = (profile as any)?.interests || []
	const languages = profile?.languages || []
	const expertise = company ? profile?.profession || [] : []
	const skills = !company ? profile?.skills || [] : []
	const identity = company ? profile?.organization : profile?.full_name
	const subtitle = company
		? `${(profile as any)?.profession?.[0] || "Profession not set"}${profile?.organization ? ` – ${profile.organization}` : ""}`
		: student
		? `${profile?.education_level || "Level not set"}${profile?.organization ? ` – ${profile.organization}` : ""}`
		: `${profile?.title || "Title not set"}${profile?.organization ? ` – ${profile.organization}` : ""}`

	const bannerText = company
		? `Welcome ${identity || "there"} - Relevance & Visibility has never been easier until now!`
		: professional
		? `Welcome ${identity || "there"} - Ready to connect, grow and lead in Kenya's Built Environment?`
		: `Welcome ${identity || "there"} - Your journey into the industry starts right here!`

	const completion = profile ? profile.profile_completion_score ?? calculateProfileCompletion(profile) : 0

	const sectionOrder = useMemo(
		() => ({
			aboutActivity: true,
			skills: !company,
			expertise: company,
			portfolio: !company,
			featured: company,
			experience: student || professional,
			education: student || professional,
			certifications: professional,
			languages: true,
			products: company,
			milestones: company,
			locations: company,
		}),
		[student, professional, company]
	)

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
			</div>
		)
	}

	if (!profile) {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<h3 className="mb-2 text-lg font-semibold">Profile Not Found</h3>
					<p className="text-muted-foreground">This profile doesn't exist or is not public.</p>
				</CardContent>
			</Card>
		)
	}

	// For student profiles, use ProfileBoard-style layout
	if (student) {
		return (
			<div className="space-y-6 p-6 md:px-0 max-w-5xl mx-auto">
				{/* Header - matching image format */}
				<Card>
					<CardContent className="!mt-1 px-0 py-6">
						<div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
							{/* Info and Avatar */}
							<div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0 lg:space-x-6">
								<div className="relative">
									<Avatar className="h-20 w-20 md:h-24 md:w-24">
										<AvatarImage src={profile.avatar || undefined} />
										<AvatarFallback className="text-2xl bg-yellow-100 text-yellow-700">
											{profile.full_name?.[0]?.toUpperCase() || "U"}
										</AvatarFallback>
									</Avatar>
								</div>
								<div className="flex-1">
									<div className="space-y-3">
										<div className="flex items-start gap-3">
											<div className="flex-1">
												<h1 className="mb-1 text-2xl font-bold text-foreground">{profile.full_name || "User"}</h1>
												<div className="mt-1 flex items-center gap-2">
													<AccountTypeBadge userType={profile.user_type || "student"} />
												</div>
												<p className="mt-2 text-base text-muted-foreground">
													{profile.education_level || "Level not set"}
													{profile.organization && <span> - {profile.organization}</span>}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
							{/* Action Buttons */}
							<div className="flex flex-col gap-4 items-end">
								<div className="flex flex-col gap-2 sm:flex-row justify-end">
									{!isOwner && renderConnectButtons()}
									{isOwner && (
										<Button variant="outline" size="sm" onClick={() => window.location.href = "/profile"}>
											<Pencil className="h-4 w-4 mr-1" />
											Edit Profile
										</Button>
									)}
								</div>
								{/* Social Links */}
								<div className="flex items-center gap-2 flex-wrap justify-end">
									<SocialMediaLinks links={profile.social_links || {}} editable={false} />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* About & Activity Tabs */}
				<Card className="border border-border bg-card shadow-sm">
					<CardContent className="p-0">
						<Tabs defaultValue="about" className="w-full">
							<div className="border-b border-border">
								<TabsList className="w-full h-auto p-0 bg-transparent rounded-none border-0">
									<TabsTrigger
										value="about"
										className="flex-1 rounded-none border border-transparent border-b-0 bg-transparent text-foreground/80 data-[state=active]:bg-muted data-[state=active]:text-foreground py-3 px-6"
									>
										About
									</TabsTrigger>
									<TabsTrigger
										value="activity"
										className="flex-1 rounded-none border border-transparent border-b-0 bg-transparent text-foreground/80 data-[state=active]:bg-muted data-[state=active]:text-foreground py-3 px-6"
									>
										Activity
									</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value="about" className="mt-0 p-4">
								<ProfileAbout
									profile={profile}
									handleProfileUpdate={() => {}}
									compact={true}
								/>
							</TabsContent>
							<TabsContent value="activity" className="mt-0 p-4">
								<ProfileActivity userPosts={userPosts} noCard={true} />
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>

				{/* Skills */}
				<CompactSkillsSection
					profile={profile}
					handleProfileUpdate={() => {}}
					canEdit={isOwner}
				/>

				{/* Portfolio */}
				<PortfolioSection
					profile={profile}
					handleProfileUpdate={() => {}}
					canEdit={isOwner}
				/>

				{/* Professional Experience */}
				<ExperienceSection
					profile={profile}
					handleProfileUpdate={() => {}}
					canEdit={isOwner}
				/>

				{/* Education & Training */}
				<EducationSection
					profile={profile}
					handleProfileUpdate={() => {}}
					canEdit={isOwner}
				/>

				{/* Licences & Certifications */}
				<CertificationsSection
					profile={profile}
					handleProfileUpdate={() => {}}
					canEdit={isOwner}
				/>
			</div>
		)
	}

	// Original layout for professional and company profiles
	return (
		<div className="mx-auto max-w-5xl space-y-6 pb-10">
			<Card className="overflow-hidden border-primary/20">
				<div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5">
					<p className="text-sm font-medium text-primary">{bannerText}</p>
				</div>
				<CardContent className="p-6 space-y-4">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="flex gap-4">
							<Avatar className="h-20 w-20 md:h-24 md:w-24">
								<AvatarImage src={profile.avatar || undefined} />
								<AvatarFallback className="text-2xl">{identity?.[0]?.toUpperCase() || "U"}</AvatarFallback>
							</Avatar>
							<div className="space-y-1">
								<div className="flex items-center gap-2 flex-wrap">
									<h1 className="text-2xl font-bold leading-tight">{identity}</h1>
									<Badge variant="outline" className="capitalize">
										{profile.user_type}
									</Badge>
								</div>
								<p className="text-sm text-muted-foreground">{subtitle}</p>
								<div className="flex items-center gap-4 text-xs text-muted-foreground">
									<div className="flex items-center gap-1">
										<Globe2 className="h-4 w-4" />
										<span>{profile.profile_visibility === "public" ? "Public profile" : "Private"}</span>
									</div>
									{!company && (
										<div className="flex items-center gap-1">
											<Briefcase className="h-4 w-4" />
											<span>{professional ? "Professional" : "Student"}</span>
										</div>
									)}
								</div>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							{mode === "edit" ? (
								<Button variant="outline" size="sm">
									<Pencil className="h-4 w-4 mr-1" />
									Edit Profile
								</Button>
							) : (
								renderConnectButtons()
							)}
						</div>
					</div>

					<div className="flex flex-wrap gap-4 text-sm">
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="uppercase text-[10px]">
								{profile.user_type}
							</Badge>
						</div>
						<div className="text-muted-foreground">
							<strong>{portfolioItems.length || featuredItems.length}</strong>{" "}
							{company ? "Featured items" : "Portfolio items"}
						</div>
						<div className="text-muted-foreground">
							<strong>{connections.length || people.length || 0}</strong>{" "}
							{company ? "Staff / Followers" : "Connections"}
						</div>
					</div>

					<SocialMediaLinks links={profile.social_links || {}} />

					{mode === "edit" && (
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="font-medium">Profile completion</span>
								<span className="text-muted-foreground">{completion}%</span>
							</div>
							<Progress value={completion} />
						</div>
					)}
				</CardContent>
			</Card>

			{sectionOrder.aboutActivity && (
				<SectionCard
					title="About & Activity"
					mode={mode}
					onEdit={() => toast({ title: "Edit About", description: "Coming soon" })}
				>
					<div className="grid gap-6 md:grid-cols-2 md:items-stretch">
						<div className="space-y-3">
							<h3 className="text-sm font-semibold">About</h3>
							<ReadMoreText text={profile.bio || ""} />
						</div>
						<div className="space-y-3">
							<h3 className="text-sm font-semibold">Activity</h3>
							{(profile as any)?.activity?.length ? (
								<ul className="space-y-2 text-sm">
									{(profile as any).activity.slice(0, 4).map((item: any, idx: number) => (
										<li key={idx} className="rounded-md border px-3 py-2">
											{item.title || "Recent activity"}
										</li>
									))}
								</ul>
							) : (
								<p className="text-sm text-muted-foreground">No activity yet.</p>
							)}
						</div>
					</div>
				</SectionCard>
			)}

			{sectionOrder.skills && (
				<SectionCard
					title="Skills"
					mode={mode}
					onAdd={() => toast({ title: "Add Skill", description: "Coming soon" })}
					onEdit={() => toast({ title: "Edit Skills", description: "Coming soon" })}
				>
					<TagList items={skills} />
				</SectionCard>
			)}

			{sectionOrder.expertise && (
				<SectionCard
					title="Expertise"
					mode={mode}
					onAdd={() => toast({ title: "Add Expertise", description: "Coming soon" })}
					onEdit={() => toast({ title: "Edit Expertise", description: "Coming soon" })}
				>
					<TagList items={expertise} />
				</SectionCard>
			)}

			{sectionOrder.portfolio && (
				<SectionCard
					title="Portfolio"
					subTitle={`Portfolio (${portfolioItems.length}/3 items uploaded)`}
					mode={mode}
					onAdd={() => toast({ title: "Add Project", description: "Coming soon" })}
				>
					<ItemGrid items={portfolioItems} mode={mode} ctaLabel="+ Add Project" onAdd={() => toast({ title: "Add Project", description: "Coming soon" })} />
				</SectionCard>
			)}

			{sectionOrder.featured && (
				<SectionCard
					title="Featured"
					subTitle={`Featured (${featuredItems.length}/3 items uploaded)`}
					mode={mode}
					onAdd={() => toast({ title: "Add Item", description: "Coming soon" })}
				>
					<ItemGrid items={featuredItems} mode={mode} ctaLabel="+ Add Item" onAdd={() => toast({ title: "Add Item", description: "Coming soon" })} />
				</SectionCard>
			)}

			{sectionOrder.experience && (
				<SectionCard
					title="Professional Experience"
					optional={student}
					mode={mode}
					onAdd={() => toast({ title: "Add Experience", description: "Coming soon" })}
					onEdit={() => toast({ title: "Edit Experience", description: "Coming soon" })}
				>
					{experienceItems?.length ? (
						<div className="space-y-4">
							{experienceItems.map((exp: any, index: number) => (
								<div key={index} className="rounded-lg border p-4 space-y-1">
									<h4 className="font-semibold">{exp.title || "Role"}</h4>
									<p className="text-sm text-muted-foreground">{exp.company || exp.organization || "Company not set"}</p>
									<p className="text-xs text-muted-foreground">
										{exp.startDate || "—"} - {exp.endDate || "Present"}
									</p>
									{exp.description && <p className="text-sm">{exp.description}</p>}
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">No experience added yet.</p>
					)}
				</SectionCard>
			)}

			{sectionOrder.education && (
				<SectionCard
					title="Education & Training"
					mode={mode}
					onAdd={() => toast({ title: "Add Education", description: "Coming soon" })}
					onEdit={() => toast({ title: "Edit Education", description: "Coming soon" })}
				>
					{profile.education?.length ? (
						<div className="space-y-4">
							{profile.education.map(
								({ degree, institution, description, endDate, startDate }: Education, index: number) => (
									<div
										key={index}
										className="flex items-start gap-4 rounded-2xl border border-border bg-muted px-5 py-4"
									>
										<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
											<span className="text-lg font-semibold text-primary">🎓</span>
										</div>
										<div className="flex-1 space-y-1">
											<h4 className="text-base font-semibold">
												{degree || "Course Title"}
											</h4>
											<p className="text-sm text-muted-foreground">
												{institution || "Institution / School"}
											</p>
											<p className="text-xs text-muted-foreground">
												{startDate || "—"} - {endDate || "Present"}
											</p>
											{description && <p className="text-sm">{description}</p>}
										</div>
									</div>
								),
							)}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">No education added yet.</p>
					)}
				</SectionCard>
			)}

			{sectionOrder.certifications && (
				<SectionCard
					title="Licenses & Certification"
					mode={mode}
					onAdd={() => toast({ title: "Add Certification", description: "Coming soon" })}
					onEdit={() => toast({ title: "Edit Certification", description: "Coming soon" })}
				>
					{certificationItems?.length ? (
						<div className="space-y-4">
							{certificationItems.map((cert: any, index: number) => (
								<div
									key={index}
									className="flex items-start gap-4 rounded-2xl border border-border bg-muted px-5 py-4"
								>
									<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
										<span className="text-lg font-semibold text-primary">🏅</span>
									</div>
									<div className="flex-1 space-y-1">
										<h4 className="text-base font-semibold">
											{cert.name || cert.title || "License / Certificate"}
										</h4>
										<p className="text-sm text-muted-foreground">
											{cert.issuer || cert.authority || "Issuing Authority"}
										</p>
										<p className="text-xs text-muted-foreground">
											{cert.date || cert.issued || "Time issued"}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-muted-foreground">No certifications added yet.</p>
					)}
				</SectionCard>
			)}

			<SectionCard
				title="Languages"
				mode={mode}
				onAdd={() => toast({ title: "Add Language", description: "Coming soon" })}
				onEdit={() => toast({ title: "Edit Languages", description: "Coming soon" })}
			>
				{languages?.length ? <TagList items={languages} /> : <p className="text-sm text-muted-foreground">No languages provided.</p>}
			</SectionCard>

			{/* Connections section is intentionally hidden here to match the student layout design */}

			{company && (
				<SectionCard title="Staff" mode={mode}>
					<PreviewList
						title="Staff"
						items={people}
						mode={mode}
						onMore={() => toast({ title: "View staff", description: "Coming soon" })}
						onAdd={mode === "edit" ? () => toast({ title: "Add Staff", description: "Coming soon" }) : undefined}
					/>
					<Separator className="my-4" />
					<PreviewList
						title="Following"
						items={following}
						mode={mode}
						onMore={() => toast({ title: "View following", description: "Coming soon" })}
						onAdd={mode === "edit" ? () => toast({ title: "Add Following", description: "Coming soon" }) : undefined}
					/>
				</SectionCard>
			)}

			{interests?.length ? (
				<SectionCard title="Interests" mode={mode}>
					<TagList items={interests} />
					{mode === "view" && (
						<Button
							size="sm"
							variant="ghost"
							className="mt-3"
							onClick={() => toast({ title: "More interests", description: "Coming soon" })}
						>
							<MoreHorizontal className="h-4 w-4 mr-1" />
							More
						</Button>
					)}
				</SectionCard>
			) : null}
		</div>
	)
}

export default PublicProfileView

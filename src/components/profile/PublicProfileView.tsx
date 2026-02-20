import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, UserPlus, Plus, Pencil, MoreHorizontal } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { publicProfileService } from "@/services/publicProfileService"
import { useToast } from "@/hooks/use-toast"
import { Products, UserProfile } from "@/types"
import { connectionsService } from "@/services/connectionsService"
import { postsService } from "@/services/postsService"
import { useMessagingStore } from "@/stores/messagingStore"
import AccountTypeBadge from "../AccountTypeBadge"
import AboutActivitySection from "../profile-sections/details/AboutActivitySection"
import CertificationsSection from "../profile-sections/details/CertificationsSection"
import EducationSection from "../profile-sections/details/EducationSection"
import ExperienceSection from "../profile-sections/details/ExperienceSection"
import PortfolioSection from "../profile-sections/details/PortfolioSection"
import ProfileSkillsSection from "../profile-sections/details/ProfileSkillsSection"
import SocialMediaLinks from "./SocialMediaLinks"

type ConnectionStatus = "not_connected" | "pending_outgoing" | "pending_incoming" | "connected" | "self"

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
					{badge && (
						<Badge
							variant="secondary"
							className="text-[11px]">
							{badge}
						</Badge>
					)}
					{optional && <span className="text-xs text-muted-foreground">(optional)</span>}
				</div>
				{subTitle && <p className="mt-1 text-sm text-muted-foreground">{subTitle}</p>}
			</div>
			{mode === "edit" && (onEdit || onAdd) && (
				<div className="flex items-center gap-2">
					{onAdd && (
						<Button
							size="sm"
							variant="outline"
							onClick={onAdd}
							className="h-8">
							<Plus className="mr-1 h-4 w-4" />
							Add
						</Button>
					)}
					{onEdit && (
						<Button
							size="sm"
							variant="ghost"
							onClick={onEdit}
							className="h-8">
							<Pencil className="mr-1 h-4 w-4" />
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
				<Button
					variant="link"
					className="h-auto p-0 text-sm"
					onClick={() => setExpanded((v) => !v)}>
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
				<Badge
					key={`${item}-${idx}`}
					variant="secondary"
					className="capitalize">
					{item}
				</Badge>
			))}
		</div>
	)
}

const ItemGrid = ({ items, mode, ctaLabel = "+ Add", onAdd }: { items: Products[]; mode: Mode; ctaLabel?: string; onAdd?: () => void }) => {
	const displayItems = items.slice(0, 3)
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{displayItems.map((item, idx) => (
				<Card
					key={`${item.title}-${idx}`}
					className="cursor-pointer transition-colors hover:border-primary/50">
					<CardContent className="space-y-2 p-4">
						<h4 className="font-semibold">{item.title || "Untitled"}</h4>
						<p className="line-clamp-3 text-sm text-muted-foreground">{item.description || "No description"}</p>
						{item.url && (
							<Button
								variant="link"
								className="h-auto p-0 text-sm"
								onClick={() => window.open(item.url, "_blank")}>
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
					className="flex h-full min-h-[140px] items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary">
					{ctaLabel}
				</button>
			)}
		</div>
	)
}

const PreviewList = ({ title, items, mode, onMore, onAdd }: { title: string; items: { name?: string; role?: string; avatar?: string }[]; mode: Mode; onMore?: () => void; onAdd?: () => void }) => (
	<div className="space-y-3">
		<div className="flex items-center justify-between">
			<h4 className="text-sm font-semibold">{title}</h4>
			<div className="flex gap-2">
				{onMore && (
					<Button
						size="sm"
						variant="ghost"
						className="h-8"
						onClick={onMore}>
						<MoreHorizontal className="mr-1 h-4 w-4" />
						More
					</Button>
				)}
				{mode === "edit" && onAdd && (
					<Button
						size="sm"
						variant="outline"
						className="h-8"
						onClick={onAdd}>
						<Plus className="mr-1 h-4 w-4" />
						Add
					</Button>
				)}
			</div>
		</div>
		{items?.length ? (
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{items.slice(0, 6).map((item, idx) => (
					<div
						key={`${item.name}-${idx}`}
						className="flex items-center gap-3 rounded-md border p-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={item.avatar} />
							<AvatarFallback>{item.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="truncate text-sm font-medium">{item.name || "Unknown"}</p>
							<p className="truncate text-xs text-muted-foreground">{item.role || "—"}</p>
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
	const anyProfile = profile
	add(!!anyProfile.experience?.length || !!anyProfile.experiences?.length, 15)
	add(profile?.portfolio?.length > 0 || profile?.products?.length > 0, 15)
	add(!!profile.social_links && Object.keys(profile.social_links).length > 0, 10)
	add(!!profile.languages?.length, 5)
	add(!!profile.Certification?.length, 5)
	// connections only exist on some subtypes
	add(!!profile.connections?.length || !!profile?.people?.length, 10)
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

	const openConversation = useMessagingStore((state) => state.openConversation)

	useEffect(() => {
		loadPublicProfile()
	}, [profileId])

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
					if (openConversation) {
						openConversation(profileId!, profile?.full_name, profile?.avatar)
					} else {
						toast({ title: "Info", description: "Messaging coming soon!", variant: "default" })
					}
				}}
				className={connectionStatus !== "connected" ? "opacity-60 cursor-not-allowed" : ""}
				title={connectionStatus !== "connected" ? "Connect first to send messages" : ""}
				disabled={connectionStatus !== "connected"}>
				<MessageCircle className="mr-2 h-4 w-4" />
				Message
			</Button>
		)

		if (connectionStatus === "connected") {
			return (
				<>
					<Button
						variant="outline"
						disabled>
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

	if (profile.profile_visibility === "private") {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<h3 className="mb-2 text-lg font-semibold">Profile is Private</h3>
					<p className="text-muted-foreground">This profile is not public.</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6 p-6 md:px-0">
			{/* Header - matching image format */}
			<Card>
				<CardContent className="!mt-1 py-6">
					<div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
						{/* Info and Avatar */}
						<div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0 lg:space-x-6">
							<div className="relative">
								<Avatar className="h-20 w-20 md:h-24 md:w-24">
									<AvatarImage src={profile.avatar || undefined} />
									<AvatarFallback className="bg-yellow-100 text-2xl text-yellow-700">{profile.full_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
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
						<div className="flex flex-col items-end gap-4">
							<div className="flex flex-col justify-end gap-2 sm:flex-row">
								{!isOwner && renderConnectButtons()}
								{isOwner && (
									<Button
										variant="outline"
										size="sm"
										onClick={() => (window.location.href = "/profile")}>
										<Pencil className="mr-1 h-4 w-4" />
										Edit Profile
									</Button>
								)}
							</div>
							{/* Social Links */}
							<div className="flex flex-wrap items-center justify-end gap-2">
								<SocialMediaLinks
									links={profile.social_links || {}}
									editable={false}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* About & Activity Tabs */}
			<AboutActivitySection
				publicProfile={true}
				profile={profile}
				userPosts={userPosts}
			/>

			{/* Skills */}
			<ProfileSkillsSection profile={profile} />

			{/* Portfolio */}
			<PortfolioSection profile={profile} />

			{/* Professional Experience */}
			<ExperienceSection profile={profile} />

			{/* Education & Training */}
			<EducationSection profile={profile} />

			{/* Licences & Certifications */}
			<CertificationsSection profile={profile} />
		</div>
	)
}

export default PublicProfileView

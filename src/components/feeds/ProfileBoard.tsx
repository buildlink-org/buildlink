import ProfileHeader from "./ProfileHeader"

import PortfolioSection from "../profile-sections/details/PortfolioSection"
import ProfileEducation from "../profile-sections/details/EducationSection"
import ProfileExperience from "../profile-sections/details/ExperienceSection"
import ProfileSkillsSection from "../profile-sections/details/ProfileSkillsSection"
import ProfileCertifications from "../profile-sections/details/CertificationsSection"
import LanguagesSection from "../profile-sections/details/LanguagesSection"

import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent } from "@/components/ui/card"
import ProfileCompletionIndicator from "@/components/profile/ProfileCompletionIndicator"
import SectionHeader from "@/components/profile/SectionHeader"
import EmptyState from "@/components/profile/EmptyState"
import { BookOpen, Users, Sparkles, Package } from "lucide-react"
import { UserProfile } from "@/types"
import { connectionsService } from "@/services/connectionsService"
import { publicProfileService } from "@/services/publicProfileService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useMemo, useState } from "react"
import AboutActivitySection from "../profile-sections/details/AboutActivitySection"
import SuggestedConnections from "@/components/profile/SuggestedConnections"
import ShareProfileDialog from "@/components/profile/ShareProfileDialog"
import { Share2 } from "lucide-react"

// ---------------------------------------------------------------------------
// Shared profile types
// ---------------------------------------------------------------------------

interface ConnectionProfileRow {
	id: string
	full_name: string | null
	avatar: string | null
}

// ---------------------------------------------------------------------------
// Right discovery rail: profile strength, visibility, connections
// ---------------------------------------------------------------------------

const ProfileRail = ({
	profile,
	connections,
	connectionsLoading,
	onChangeVisibility,
	savingVisibility,
}: {
	profile: UserProfile
	connections: ConnectionProfileRow[]
	connectionsLoading: boolean
	/** Fix #5 — working visibility control (persisted to the profiles table) */
	onChangeVisibility: (visibility: "public" | "private" | "connections") => void
	savingVisibility: boolean
}) => {
	const completion = profile.profile_completion_score || 0

	const missing: string[] = []
	if (!profile.bio) missing.push("a professional summary")
	if (!profile.portfolio?.length) missing.push("a featured project")
	if (!profile.skills?.length) missing.push("your skills")
	if (!profile.experiences?.length) missing.push("your experience")

	const visibilityLabel =
		profile.profile_visibility === "private"
			? "only you"
			: profile.profile_visibility === "connections"
				? "your connections"
				: "everyone"

	const myProfessions = useMemo(() => {
		const p = (profile as { profession?: string | string[] | null }).profession
		if (!p) return []
		return Array.isArray(p) ? p.filter(Boolean) : [p]
	}, [profile])

	return (
		<div className="space-y-5">
			{/* Profile strength */}
			<Card>
				<CardContent className="p-5">
					<SectionHeader title="Profile strength" />
					<ProfileCompletionIndicator score={completion} showDetails={completion < 100} />
					{completion < 100 && missing.length > 0 && (
						<div className="mt-3 border-t border-border pt-3">
							<p className="mb-2 text-xs font-medium text-muted-foreground">Completing these next helps you get found:</p>
							<ul className="flex flex-wrap gap-1.5">
								{missing.slice(0, 3).map((item) => (
									<li key={item} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
										+ {item}
									</li>
								))}
							</ul>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Profile visibility + share / public preview (report §8) */}
			<Card>
				<CardContent className="p-5">
					<SectionHeader title="Profile visibility" description="Who can see your profile" />
					{/* Fix #5 — working visibility control (persisted to the profiles table) */}
					<label className="sr-only" htmlFor="profile-visibility">
						Choose who can view your profile
					</label>
					<select
						id="profile-visibility"
						value={profile.profile_visibility || "public"}
						onChange={(e) =>
							onChangeVisibility(e.target.value as "public" | "private" | "connections")
						}
						disabled={savingVisibility}
						className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm capitalize text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
					>
						<option value="public">Public — {visibilityLabel === "everyone" ? visibilityLabel : "everyone"}</option>
						<option value="connections">Connections only</option>
						<option value="private">Private — only you</option>
					</select>
					<p className="mt-2 text-[11px] leading-snug text-muted-foreground">
						{savingVisibility
							? "Saving…"
							: `Currently visible to ${visibilityLabel}.`}
					</p>
					<div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
						<ShareProfileDialog
							profileId={profile.id}
							profileName={profile.full_name}
							trigger={
								<button
									type="button"
									className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
									<Share2 className="h-3.5 w-3.5" aria-hidden="true" />
									Share profile
								</button>
							}
						/>
						<a
							href={`/profile/${profile.id}`}
							target="_blank"
							rel="noreferrer"
							className="text-xs font-medium text-primary hover:underline">
							View public profile
						</a>
					</div>
				</CardContent>
			</Card>

			{/* Connections preview */}
			<Card>
				<CardContent className="py-5">
					<SectionHeader
						title="Connections"
						count={connections.length}
						countUnit="connections"
						description="People in your professional network"
					/>
					{connectionsLoading ? (
						<p className="text-sm text-muted-foreground">Loading connections…</p>
					) : connections.length > 0 ? (
						<div className="grid grid-cols-4 gap-3">
							{connections.map((conn) => (
								<div key={conn.id} className="flex flex-col items-center gap-1.5">
									{conn.avatar ? (
										<img
											src={conn.avatar}
											alt={conn.full_name || "Connection"}
											className="h-10 w-10 rounded-full object-cover"
											loading="lazy" />
									) : (
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
											{(conn.full_name || "?").charAt(0).toUpperCase()}
										</div>
									)}
									<span className="max-w-[60px] truncate text-[10px] leading-none text-muted-foreground">
										{conn.full_name?.split(" ")[0] || "Member"}
									</span>
								</div>
							))}
						</div>
					) : (
						<EmptyState
							icon={<Users className="h-5 w-5" />}
							title="No connections yet"
							description="Connect with professionals in the built environment to grow your network."
						/>
					)}
				</CardContent>
			</Card>

			{/* Suggested connections — self-hiding when there are no suggestions */}
			<SuggestedConnections profileId={profile.id} myProfessions={myProfessions} />
		</div>
	)
}

// ---------------------------------------------------------------------------
// Company profile sections (data-driven, no placeholder content)
// ---------------------------------------------------------------------------

const CompanyFeatured = ({ profile }: { profile: UserProfile }) => {
	const featured = Array.isArray(profile.featured) ? profile.featured : []

	return (
		<Card>
			<CardContent className="p-5">
				<SectionHeader
					title="Featured"
					count={featured.length}
					countUnit="items"
					description="Highlighted products and services"
				/>
				{featured.length > 0 ? (
					<div className="space-y-3">
						{featured.map((item, index) => (
							<div key={`${item.title || item.name || "featured"}-${index}`} className="flex items-start gap-3 rounded-lg border border-border p-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
									<Sparkles className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-semibold text-foreground">{item.title || item.name}</p>
									{item.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}
									{item.link && (
										<a className="mt-1 inline-block text-xs text-primary hover:underline" href={item.link} target="_blank" rel="noreferrer">
											View details
										</a>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						icon={<Sparkles className="h-5 w-5" />}
						title="No featured items yet"
						description="Showcase your company’s key products and services to stand out."
					/>
				)}
			</CardContent>
		</Card>
	)
}

const CompanyProducts = ({ profile }: { profile: UserProfile }) => {
	const products = Array.isArray(profile.products) ? profile.products : []

	return (
		<Card>
			<CardContent className="p-5">
				<SectionHeader
					title="Products & Services"
					count={products.length}
					countUnit="products"
					description="What your company offers"
				/>
				{products.length > 0 ? (
					<div className="space-y-3">
						{products.map((item, index) => (
							<div key={`${item.name || item.title || "product"}-${index}`} className="flex items-start gap-3 rounded-lg border border-border p-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
									<Package className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-semibold text-foreground">{item.name || item.title}</p>
									{item.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}
									{item.link && (
										<a className="mt-1 inline-block text-xs text-primary hover:underline" href={item.link} target="_blank" rel="noreferrer">
											View details
										</a>
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState
						icon={<Package className="h-5 w-5" />}
						title="No products or services listed"
						description="Add the products and services your company provides."
					/>
				)}
			</CardContent>
		</Card>
	)
}

const ProfileBoard = () => {
	const { profile, userPosts, loading, uploading, handleProfileUpdate, handleAvatarChange, handleAvatarRemove } = useProfile()
	const [connections, setConnections] = useState<ConnectionProfileRow[]>([])
	const [connectionsLoading, setConnectionsLoading] = useState(false)
	// Fix #5 — working profile visibility control
	const [savingVisibility, setSavingVisibility] = useState(false)
	const { toast } = useToast()

	const handleChangeVisibility = async (
		visibility: "public" | "private" | "connections"
	) => {
		setSavingVisibility(true)
		const { error } = await publicProfileService.updateProfileVisibility(visibility)
		setSavingVisibility(false)
		if (error) {
			toast({
				title: "Update failed",
				description: "We couldn't change your profile visibility. Please try again.",
				variant: "destructive",
			})
			return
		}
		toast({
			title: "Visibility updated",
			description: `Your profile is now visible to ${
				visibility === "public" ? "everyone" : visibility === "connections" ? "your connections" : "only you"
			}.`,
			variant: "default",
		})
		handleProfileUpdate()
	}

	// Load accepted connections once the profile is known (single fetch, shared by stats + rail)
	useEffect(() => {
		if (!profile?.id) return
		setConnectionsLoading(true)
		;(async () => {
			const { data } = await connectionsService.getConnections(profile.id)
			const accepted = (data || []).filter((row) => row.status === "accepted")
			const otherIds = accepted
				.map((row) => (row.user_id === profile.id ? row.connected_user_id : row.user_id) as string)
				.slice(0, 8)

			if (otherIds.length === 0) {
				setConnections([])
				return
			}

			const { data: profiles } = await supabase
				.from("profiles")
				.select("id, full_name, avatar")
				.in("id", otherIds)

			setConnections(profiles || [])
		})().finally(() => setConnectionsLoading(false))
	}, [profile?.id])

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
			</div>
		)
	}

	if (!profile) {
		return (
			<div className="py-12 text-center">
				<h3 className="mb-2 text-lg font-semibold text-foreground">Profile not found</h3>
				<p className="text-muted-foreground">Unable to load profile data</p>
			</div>
		)
	}

	const userType = profile.user_type?.toLowerCase() || "student"
	const isCompany = userType === "company"
	const portfolio = Array.isArray(profile.portfolio) ? profile.portfolio : []
	const teamCount = profile.people?.length || 0

	return (
		<div className="mx-auto max-w-7xl space-y-4 px-1 py-4 sm:space-y-6 sm:px-0 sm:py-6">
			{/* Identity header */}
			<ProfileHeader
				profile={profile}
				uploading={uploading}
				handleAvatarChange={handleAvatarChange}
				handleAvatarRemove={handleAvatarRemove}
				handleProfileUpdate={handleProfileUpdate}
			/>

			{/* Stat cards — live data (profile completion lives in the right rail "Profile strength" module) */}
			<div className="grid grid-cols-2 gap-4">
				<Card className="border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
					<CardContent className="p-3 sm:p-4 relative">
						<div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-green-500/10 dark:bg-green-500/5" />
						<div className="relative flex items-center justify-between">
							<div className="min-w-0">
								<p className="text-xs sm:text-sm text-muted-foreground truncate">{isCompany ? "Team Members" : "Portfolio Items"}</p>
								<p className="text-2xl sm:text-4xl font-bold text-foreground">{isCompany ? teamCount : portfolio.length}</p>
							</div>
							<div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-green-500/15 dark:bg-green-500/10 flex-shrink-0">
								<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
					<CardContent className="p-3 sm:p-4 relative">
						<div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-purple-500/10 dark:bg-purple-500/5" />
						<div className="relative flex items-center justify-between">
							<div className="min-w-0">
								<p className="text-xs sm:text-sm text-muted-foreground truncate">Connections</p>
								<p className="text-2xl sm:text-4xl font-bold text-foreground">{connectionsLoading ? "…" : connections.length}</p>
							</div>
							<div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-500/15 dark:bg-purple-500/10 flex-shrink-0">
								<Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main content + right discovery rail */}
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-6">
				<div className="order-2 min-w-0 space-y-4 sm:space-y-6 xl:order-1">
					<AboutActivitySection
						profile={profile}
						publicProfile={false}
						userPosts={userPosts}
						handleProfileUpdate={handleProfileUpdate}
					/>
{isCompany ? (
						<>
							<CompanyFeatured profile={profile} />
							<CompanyProducts profile={profile} />
						</>
					) : (
						<>
							{/* Featured projects — project-first hierarchy */}
							<PortfolioSection
								profile={profile}
								canEdit={true}
								handleProfileUpdate={handleProfileUpdate}
							/>
							{/* Professional experience */}
							<ProfileExperience
								canEdit={true}
								profile={profile}
								handleProfileUpdate={handleProfileUpdate}
							/>
							{/* Skills */}
							<ProfileSkillsSection
								profile={profile}
								canEdit={true}
								handleProfileUpdate={handleProfileUpdate}
							/>
							{/* Education & training */}
							<ProfileEducation
								canEdit={true}
								profile={profile}
								handleProfileUpdate={handleProfileUpdate}
							/>
							{/* Licences & certifications */}
							<ProfileCertifications
								canEdit={true}
								profile={profile}
								handleProfileUpdate={handleProfileUpdate}
							/>
							{/* Languages — supporting info last */}
							<LanguagesSection
								profile={profile}
								canEdit={true}
								handleProfileUpdate={handleProfileUpdate}
							/>
						</>
					)}
				</div>

				{/* Right discovery rail (desktop >= xl; stacks below on smaller screens) */}
				<div className="order-1 min-w-0 xl:order-2">
					<ProfileRail
					profile={profile}
					connections={connections}
					connectionsLoading={connectionsLoading}
					onChangeVisibility={handleChangeVisibility}
					savingVisibility={savingVisibility}
					/>
				</div>
			</div>
		</div>
	)
}

export default ProfileBoard
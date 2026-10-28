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
import { BookOpen, Users } from "lucide-react"
import { CompanyProfile, UserProfile } from "@/types"
import { connectionsService } from "@/services/connectionsService"
import { publicProfileService } from "@/services/publicProfileService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useMemo, useState } from "react"
import AboutActivitySection from "../profile-sections/details/AboutActivitySection"
import SuggestedConnections from "@/components/profile/SuggestedConnections"
import ShareProfileDialog from "@/components/profile/ShareProfileDialog"
import { Share2 } from "lucide-react"
import CompanyProfileSections from "@/components/profile/CompanyProfileSections"

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
						title={profile.user_type === "company" ? "Following" : "Connections"}
						count={connections.length}
						countUnit={profile.user_type === "company" ? "following" : "connections"}
						description={profile.user_type === "company" ? "Profiles your company follows" : "People in your professional network"}
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

const ProfileBoard = () => {
	const { profile, userPosts, loading, uploading, handleProfileUpdate, handleAvatarChange, handleAvatarRemove } = useProfile()
	const [connections, setConnections] = useState<ConnectionProfileRow[]>([])
	const [connectionsCount, setConnectionsCount] = useState(0)
	const [connectionsLoading, setConnectionsLoading] = useState(false)
	const [staffCount, setStaffCount] = useState<number | null>(null)
	const [staffCountLoading, setStaffCountLoading] = useState(false)
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
			setConnectionsCount(
				profile.user_type === "company"
					? accepted.filter((row) => row.user_id === profile.id).length
					: accepted.length,
			)
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
	}, [profile?.id, profile?.user_type])

	useEffect(() => {
		if (!profile?.id || profile.user_type !== "company" || !profile.organization) {
			setStaffCount(null)
			return
		}
		setStaffCountLoading(true)
		void supabase
			.from("profiles")
			.select("id", { count: "exact", head: true })
			.eq("organization", profile.organization)
			.neq("id", profile.id)
			.in("user_type", ["student", "professional"])
			.eq("profile_visibility", "public")
			.then(({ count, error }) => {
				if (error) {
					toast({
						title: "Staff count unavailable",
						description: "Public staff profiles could not be loaded.",
						variant: "destructive",
					})
					return
				}
				setStaffCount(count || 0)
			})
			.finally(() => setStaffCountLoading(false))
	}, [profile?.id, profile?.organization, profile?.user_type, toast])

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
	const completion = profile.profile_completion_score || 0
	const summaryTone = isCompany
		? { bg: "bg-company-100 dark:bg-company-900/50", text: "text-company-700 dark:text-company-300" }
		: userType === "professional"
			? { bg: "bg-professional-100 dark:bg-professional-900/50", text: "text-professional-700 dark:text-professional-300" }
			: { bg: "bg-student-100 dark:bg-student-900/50", text: "text-student-700 dark:text-student-300" }

	return (
		<div className="core-vertical-grid mx-auto max-w-7xl px-1 sm:px-0">
			{/* Identity header */}
			<ProfileHeader
				profile={profile}
				uploading={uploading}
				handleAvatarChange={handleAvatarChange}
				handleAvatarRemove={handleAvatarRemove}
				handleProfileUpdate={handleProfileUpdate}
			/>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<Card className="border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
					<CardContent className="p-3 sm:p-4 relative">
						<div className={`absolute top-0 right-0 h-16 w-16 rounded-bl-full ${summaryTone.bg} opacity-60`} />
						<div className="relative flex items-center justify-between">
							<div className="min-w-0">
								<p className="text-xs sm:text-sm text-muted-foreground truncate">{isCompany ? "Staff" : "Portfolio Items"}</p>
								<p className="text-2xl sm:text-4xl font-bold text-foreground">{isCompany ? (staffCountLoading ? "…" : staffCount ?? 0) : portfolio.length}</p>
							</div>
							<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${summaryTone.bg}`}>
								<BookOpen className={`h-5 w-5 sm:h-6 sm:w-6 ${summaryTone.text}`} aria-hidden="true" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
					<CardContent className="p-3 sm:p-4 relative">
						<div className={`absolute top-0 right-0 h-16 w-16 rounded-bl-full ${summaryTone.bg} opacity-60`} />
						<div className="relative flex items-center justify-between">
							<div className="min-w-0">
								<p className="text-xs sm:text-sm text-muted-foreground truncate">{isCompany ? "Following" : "Connections"}</p>
								<p className="text-2xl sm:text-4xl font-bold text-foreground">{connectionsLoading ? "…" : connectionsCount}</p>
							</div>
							<div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${summaryTone.bg}`}>
								<Users className={`h-5 w-5 sm:h-6 sm:w-6 ${summaryTone.text}`} aria-hidden="true" />
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
					<CardContent className="p-3 sm:p-4">
						<ProfileCompletionIndicator score={completion} />
					</CardContent>
				</Card>
			</div>

			<div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_18rem] 2xl:items-start">
				<div className="min-w-0 space-y-4 sm:space-y-6">
					<AboutActivitySection
						profile={profile}
						publicProfile={false}
						userPosts={userPosts}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{isCompany ? (
						<>
							<ProfileSkillsSection
								profile={profile}
								canEdit={true}
								handleProfileUpdate={handleProfileUpdate}
							/>
							<PortfolioSection
								profile={profile}
								canEdit={true}
								handleProfileUpdate={handleProfileUpdate}
							/>
							<CompanyProfileSections
								profile={profile as CompanyProfile}
								canEdit
								onProfileUpdated={handleProfileUpdate}
							/>
						</>
					) : (
						<>
							<ProfileSkillsSection
								profile={profile}
								canEdit={true}
								handleProfileUpdate={handleProfileUpdate}
							/>
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
				<aside className="min-w-0">
					<ProfileRail
						profile={profile}
						connections={connections}
						connectionsLoading={connectionsLoading}
						onChangeVisibility={handleChangeVisibility}
						savingVisibility={savingVisibility}
					/>
				</aside>
			</div>
		</div>
	)
}

export default ProfileBoard
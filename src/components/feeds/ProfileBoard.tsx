import ProfileHeader from "./ProfileHeader"

import PortfolioSection from "../profile-sections/details/PortfolioSection"
import ProfileEducation from "../profile-sections/details/EducationSection"
import ProfileExperience from "../profile-sections/details/ExperienceSection"
import ProfileSkillsSection from "../profile-sections/details/ProfileSkillsSection"
import ProfileCertifications from "../profile-sections/details/CertificationsSection"
import LanguagesSection from "../profile-sections/details/LanguagesSection"
import ProfilePeople from "../profile/ProfilePeople"
import ProfileProducts from "../profile/ProfileProducts"

import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProfileCompletionIndicator from "@/components/profile/ProfileCompletionIndicator"
import { BookOpen, Users, Edit } from "lucide-react"
import { UserProfile } from "@/types"
import AboutActivitySection from "../profile-sections/details/AboutActivitySection"

// About & Activity Tabbed Component

// Connections Preview Component
const ConnectionsPreview = ({ profile }: { profile: UserProfile }) => {
	// TODO: Fetch from connectionsService
	const connections: any[] = []

	return (
		<Card>
			<CardContent className="py-5">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-lg font-semibold">Connections</h3>
					<Button
						variant="outline"
						size="sm">
						View All
					</Button>
				</div>
				{connections.length > 0 ? (
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{connections.slice(0, 8).map((conn) => (
							<div
								key={conn.id}
								className="text-center">
								{/* Connection preview card */}
							</div>
						))}
					</div>
				) : (
					<p className="py-4 text-center text-muted-foreground">No connections yet</p>
				)}
			</CardContent>
		</Card>
	)
}

const ProfileBoard = () => {
	const { profile, userPosts, loading, uploading, handleProfileUpdate, handleAvatarChange, handleAvatarRemove } = useProfile()

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

	return (
		<div className="mx-auto max-w-5xl space-y-6 py-6 md:px-0">
			{/* Header */}
			<ProfileHeader
				profile={profile}
				uploading={uploading}
				handleAvatarChange={handleAvatarChange}
				handleAvatarRemove={handleAvatarRemove}
				handleProfileUpdate={handleProfileUpdate}
			/>

		{/* Stats Cards */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
				<Card className="border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
					<CardContent className="p-3 sm:p-4 relative">
						<div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-green-500/10 dark:bg-green-500/5" />
						<div className="relative flex items-center justify-between">
							<div className="min-w-0">
								<p className="text-xs sm:text-sm text-muted-foreground truncate">{userType === "company" ? "Staff" : "Portfolio Items"}</p>
								<p className="text-2xl sm:text-4xl font-bold text-foreground">{userType === "company" ? 0 : profile.portfolio?.length || 0}</p>
							</div>
							<div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-green-500/15 dark:bg-green-500/10 flex-shrink-0">
								<BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border border-border overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
					<CardContent className="p-3 sm:p-4 relative">
						<div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-purple-500/10 dark:bg-purple-500/5" />
						<div className="relative flex items-center justify-between">
							<div className="min-w-0">
								<p className="text-xs sm:text-sm text-muted-foreground truncate">{userType === "company" ? "Following" : "Connections"}</p>
								<p className="text-2xl sm:text-4xl font-bold text-foreground">0</p>
							</div>
							<div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-500/15 dark:bg-purple-500/10 flex-shrink-0">
								<Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="col-span-2 md:col-span-2 border border-border overflow-hidden transition-all hover:shadow-md">
					<CardContent className="p-3 sm:p-4 relative">
						<div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-primary/10 dark:bg-primary/5" />
						<div className="relative">
							<ProfileCompletionIndicator
								score={profile?.profile_completion_score || 0}
								showDetails
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* About & Activity - Horizontal 2-column */}
			<AboutActivitySection
				profile={profile}
				publicProfile={false}
				userPosts={userPosts}
				handleProfileUpdate={handleProfileUpdate}
			/>

			{/* Skills/Expertise - Right below About/Activity */}
			<div>
				<ProfileSkillsSection
					profile={profile}
					canEdit={true}
					handleProfileUpdate={handleProfileUpdate}
				/>
			</div>

			{/* Account Type Specific Sections */}
			{userType === "student" && (
				<>
					<PortfolioSection
						profile={profile}
						canEdit={true}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{/* Professional Experience - on its own */}
					<ProfileExperience
						canEdit={true}
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{/* Education & Training - on its own */}
					<ProfileEducation
						canEdit={true}
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{/* Licenses & Certifications - on its own */}
					<ProfileCertifications
						canEdit={true}
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					<LanguagesSection
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
				</>
			)}

			{userType === "professional" && (
				<>
					<PortfolioSection
						canEdit={true}
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{/* Professional Experience - on its own */}
					<ProfileExperience
						canEdit={true}
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{/* Education & Training - on its own */}
					<ProfileEducation
						canEdit={true}
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{/* Licenses & Certifications - on its own */}
					<ProfileCertifications
						canEdit={true}
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					<LanguagesSection
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
				</>
			)}

			{userType === "company" && (
				<>
					{/* Featured Section */}
					<Card className="border border-border shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-lg font-semibold text-foreground">Featured (3/3 items uploaded)</h3>
				<div className="flex items-center gap-3">
									<Button variant="outline" size="sm" className="rounded-md border-border text-foreground hover:bg-accent hover:text-accent-foreground dark:border-border dark:text-foreground dark:hover:bg-accent px-4 py-1 h-auto text-xs">
										+ Add Item
									</Button>
									<Edit className="h-4 w-4 text-foreground cursor-pointer" />
								</div>
							</div>
							<div className="flex flex-row justify-center items-end gap-4 sm:gap-6">
								{/* Item 3 */}
								<div className="flex flex-col w-[120px] sm:w-[140px]">
									<div className="h-3 w-[90%] bg-gray-400 dark:bg-slate-700 rounded-t-lg mx-auto" />
									<div className="h-[160px] bg-[#dcfce7] dark:bg-green-950/60 border border-gray-400 dark:border-green-800/50 rounded-b-lg rounded-t-sm p-3 relative shadow-sm">
										<div className="bg-white dark:bg-card rounded border border-gray-300 dark:border-border p-2 text-sm text-black dark:text-foreground w-full">Item 3</div>
									</div>
								</div>
								{/* Item 1 */}
								<div className="flex flex-col w-[120px] sm:w-[140px]">
									<div className="h-3 w-[90%] bg-gray-400 dark:bg-slate-700 rounded-t-lg mx-auto" />
									<div className="h-[140px] bg-[#dcfce7] dark:bg-green-950/60 border border-gray-400 dark:border-green-800/50 rounded-b-lg rounded-t-sm p-3 relative shadow-sm">
										<div className="bg-white dark:bg-card rounded border border-gray-300 dark:border-border p-2 text-sm text-black dark:text-foreground w-full">Item 1</div>
									</div>
								</div>
								{/* Item 2 */}
								<div className="flex flex-col w-[120px] sm:w-[140px]">
									<div className="h-3 w-[90%] bg-gray-400 dark:bg-slate-700 rounded-t-lg mx-auto" />
									<div className="h-[150px] bg-[#dcfce7] dark:bg-green-950/60 border border-gray-400 dark:border-green-800/50 rounded-b-lg rounded-t-sm p-3 relative shadow-sm">
										<div className="bg-white dark:bg-card rounded border border-gray-300 dark:border-border p-2 text-sm text-black dark:text-foreground w-full">Item 2</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					
					{/* Products & Services */}
					<Card className="border border-border shadow-sm">
						<CardContent className="p-6 relative">
							<div className="absolute top-4 right-4">
								<Edit className="h-4 w-4 text-foreground cursor-pointer" />
							</div>
							<h3 className="mb-4 text-lg font-semibold text-foreground">Products & Services (optional)</h3>
							<div className="flex gap-4 items-start mt-4">
								<div className="w-12 h-12 rounded bg-[#bbf7d0]" />
								<div className="space-y-1">
									<p className="font-bold text-base leading-tight text-foreground">[Product/Service]</p>
									<p className="text-sm text-muted-foreground leading-tight">[Type/Group]</p>
									<p className="text-sm text-muted-foreground leading-tight">[Availability – location]</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	)
}

export default ProfileBoard

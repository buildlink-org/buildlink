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
import { BookOpen, Users } from "lucide-react"
import { UserProfile } from "@/types"
import AboutActivitySection from "../profile-sections/details/AboutActivitySection"

// About & Activity Tabbed Component

// Connections Preview Component
const ConnectionsPreview = ({ profile }: { profile: UserProfile }) => {
	// TODO: Fetch from connectionsService
	const connections: any[] = []

	return (
		<Card>
			<CardContent className="p-6">
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
				<h3 className="mb-2 text-lg font-semibold text-gray-600">Profile not found</h3>
				<p className="text-gray-500">Unable to load profile data</p>
			</div>
		)
	}

	const userType = profile.user_type?.toLowerCase() || "student"

	return (
		<div className="mx-auto max-w-5xl space-y-6 p-6 md:px-0">
			{/* Header */}
			<ProfileHeader
				profile={profile}
				uploading={uploading}
				handleAvatarChange={handleAvatarChange}
				handleAvatarRemove={handleAvatarRemove}
				handleProfileUpdate={handleProfileUpdate}
			/>

			{/* Stats Cards - Keep existing */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card className="md:col-span-1">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Portfolio Items</p>
								<p className="text-4xl font-bold">{profile.portfolio?.length || 0}</p>
							</div>
							<BookOpen className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="md:col-span-1">
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Connections</p>
								<p className="text-4xl font-bold">0</p>
							</div>
							<Users className="h-8 w-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="md:col-span-2">
					<CardContent className="p-4">
						<ProfileCompletionIndicator
							score={profile?.profile_completion_score || 0}
							showDetails
						/>
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

			{/* Skills - Right below About/Activity */}
			{userType !== "company" && (
				<div>
					<ProfileSkillsSection
						profile={profile}
						canEdit={true}
						handleProfileUpdate={handleProfileUpdate}
					/>
				</div>
			)}

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
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{/* Professional Experience - on its own */}
					<ProfileExperience
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{/* Education & Training - on its own */}
					<ProfileEducation
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
					/>
					{/* Licenses & Certifications - on its own */}
					<ProfileCertifications
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
					<Card>
						<CardContent className="p-6">
							<h3 className="mb-4 text-lg font-semibold">Featured</h3>
							{/* Featured content */}
						</CardContent>
					</Card>
					<ProfileProducts profile={profile} />
					<ProfilePeople profile={profile} />
				</>
			)}
		</div>
	)
}

export default ProfileBoard

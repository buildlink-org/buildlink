import ProfileHeader from "./ProfileHeader";
import ProfileAbout from "./ProfileAbout";
import ProfileActivity from "./ProfileActivity";

import ProfilePortfolio from "../profile-sections/details/PortfolioSection";
import ProfileEducation from "../profile-sections/details/EducationSection";
import ProfileExperience from "../profile-sections/details/ExperienceSection";
import ProfileSkills from "../profile-sections/details/CompactSkillsSection";
import ProfileCertifications from "../profile-sections/details/CertificationsSection";
import ProfileJobs from "../profile/ProfileJobs";
import ProfilePeople from "../profile/ProfilePeople";
import ProfileProducts from "../profile/ProfileProducts";

import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileCompletionIndicator from "@/components/profile/ProfileCompletionIndicator";
import { BookOpen, Users } from "lucide-react";
import { UserProfile } from "@/types";

// About & Activity Side-by-Side Component
const AboutActivitySection = ({ 
	profile, 
	userPosts, 
	handleProfileUpdate 
}: { 
	profile: UserProfile
	userPosts: any[]
	handleProfileUpdate: () => void 
}) => {
	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
			{/* About - Left Column */}
			<div className="space-y-4 flex flex-col h-full">
				<h2 className="text-xl font-semibold">About</h2>
				<div className="flex-1">
					<ProfileAbout 
						profile={profile} 
						handleProfileUpdate={handleProfileUpdate}
						compact={true}
					/>
				</div>
			</div>
			
			{/* Activity - Right Column */}
			<div className="space-y-4 flex flex-col h-full">
				<h2 className="text-xl font-semibold">Activity</h2>
				<div className="flex-1">
					<ProfileActivity userPosts={userPosts} />
				</div>
			</div>
		</div>
	)
}

// Connections Preview Component
const ConnectionsPreview = ({ profile }: { profile: UserProfile }) => {
	// TODO: Fetch from connectionsService
	const connections: any[] = []
	
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">Connections</h3>
					<Button variant="outline" size="sm">View All</Button>
				</div>
				{connections.length > 0 ? (
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{connections.slice(0, 8).map((conn) => (
							<div key={conn.id} className="text-center">
								{/* Connection preview card */}
							</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground text-center py-4">No connections yet</p>
				)}
			</CardContent>
		</Card>
	)
}

// Following Preview Component
const FollowingPreview = ({ profile }: { profile: UserProfile }) => {
	// TODO: Fetch from following service
	const following: any[] = []
	
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">Following</h3>
					<Button variant="outline" size="sm">View All</Button>
				</div>
				{following.length > 0 ? (
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						{following.slice(0, 8).map((follow) => (
							<div key={follow.id} className="text-center">
								{/* Following preview card */}
							</div>
						))}
					</div>
				) : (
					<p className="text-muted-foreground text-center py-4">Not following anyone yet</p>
				)}
			</CardContent>
		</Card>
	)
}

const ProfileBoard = () => {
	const {
		profile,
		userPosts,
		loading,
		uploading,
		handleProfileUpdate,
		handleAvatarChange,
		handleAvatarRemove,
	} = useProfile();

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="py-12 text-center">
				<h3 className="mb-2 text-lg font-semibold text-gray-600">
					Profile not found
				</h3>
				<p className="text-gray-500">Unable to load profile data</p>
			</div>
		);
	}

	const userType = profile.user_type?.toLowerCase() || "student";

	return (
		<div className="space-y-6 p-6 md:px-0 max-w-5xl mx-auto">
			{/* Header */}
			<ProfileHeader
				profile={profile}
				uploading={uploading}
				userPostsCount={userPosts.length}
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
								<p className="text-4xl font-bold">
									{profile.portfolio?.length || 0}
								</p>
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
				userPosts={userPosts}
				handleProfileUpdate={handleProfileUpdate}
			/>

			{/* Skills - Right below About/Activity */}
			{userType !== "company" && (
				<div>
					<ProfileSkills 
						profile={profile} 
						handleProfileUpdate={handleProfileUpdate}
					/>
				</div>
			)}

			{/* Account Type Specific Sections */}
			{userType === "student" && (
				<>
					<ProfilePortfolio 
						profile={profile} 
						handleProfileUpdate={handleProfileUpdate}
					/>
					<ProfileEducation 
						profile={profile} 
						handleProfileUpdate={handleProfileUpdate}
					/>
					{profile.experience && profile.experience.length > 0 && (
						<ProfileExperience 
							profile={profile} 
							handleProfileUpdate={handleProfileUpdate}
						/>
					)}
					{profile.certifications && profile.certifications.length > 0 && (
						<ProfileCertifications 
							profile={profile} 
							handleProfileUpdate={handleProfileUpdate}
						/>
					)}
					<ConnectionsPreview profile={profile} />
					<FollowingPreview profile={profile} />
				</>
			)}

			{userType === "professional" && (
				<>
					<ProfilePortfolio 
						profile={profile} 
						handleProfileUpdate={handleProfileUpdate}
					/>
					<ProfileExperience 
						profile={profile} 
						handleProfileUpdate={handleProfileUpdate}
					/>
					<ProfileEducation 
						profile={profile} 
						handleProfileUpdate={handleProfileUpdate}
					/>
					{profile.certifications && profile.certifications.length > 0 && (
						<ProfileCertifications 
							profile={profile} 
							handleProfileUpdate={handleProfileUpdate}
						/>
					)}
					<ConnectionsPreview profile={profile} />
					<FollowingPreview profile={profile} />
				</>
			)}

			{userType === "company" && (
				<>
					{/* Featured Section */}
					<Card>
						<CardContent className="p-6">
							<h3 className="text-lg font-semibold mb-4">Featured</h3>
							{/* Featured content */}
						</CardContent>
					</Card>
					<ProfileProducts profile={profile} />
					<ProfilePeople profile={profile} />
					<FollowingPreview profile={profile} />
				</>
			)}
		</div>
	);
};

export default ProfileBoard;

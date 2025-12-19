import ProfileHeader from "./ProfileHeader";
import ProfileAbout from "./ProfileAbout";
import ProfileActivity from "./ProfileActivity";

import ProfilePortfolio from "../profile-sections/details/PortfolioSection";
import ProfileEducation from "../profile-sections/details/EducationSection";
import ProfileExperience from "../profile-sections/details/ExperienceSection";
import ProfileSkills from "../profile-sections/details/CompactSkillsSection";
import ProfileCertifications from "../profile-sections/details/CertificationsSection";
import LanguagesSection from "../profile-sections/details/LanguagesSection";
import ProfileJobs from "../profile/ProfileJobs";
import ProfilePeople from "../profile/ProfilePeople";
import ProfileProducts from "../profile/ProfileProducts";

import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProfileCompletionIndicator from "@/components/profile/ProfileCompletionIndicator";
import { BookOpen, Users } from "lucide-react";
import { UserProfile } from "@/types";
import { useState } from "react";

// About & Activity Tabbed Component
const AboutActivitySection = ({ 
	profile, 
	userPosts, 
	handleProfileUpdate 
}: { 
	profile: UserProfile
	userPosts: any[]
	handleProfileUpdate: () => void 
}) => {
	const [activeTab, setActiveTab] = useState("about");
	const userType = profile?.user_type?.toLowerCase() || "student"

	// Get account-type-specific colors matching ProfileHeader
	const getColorConfig = () => {
		if (userType === "student") {
			return {
				bgColor: "bg-yellow-100",
				borderColor: "border-yellow-50",
			}
		} else if (userType === "professional") {
			return {
				bgColor: "bg-[#FFCBA4]",
				borderColor: "border-[#FFCBA4]",
			}
		} else if (userType === "company") {
			return {
				bgColor: "bg-green-200",
				borderColor: "border-green-200",
			}
		}
		// Default fallback
		return {
			bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
			borderColor: "border-blue-200",
		}
	}

	const colorConfig = getColorConfig();

	return (
		<Card className={`${colorConfig.bgColor} border ${colorConfig.borderColor} shadow-sm`}>
			<CardContent className="p-0">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<div className="relative border-b border-gray-200">
						<TabsList className="w-full h-auto p-0 bg-transparent rounded-none border-0">
							<TabsTrigger 
								value="about" 
								className={`flex-1 rounded-none border border-b-0 text-foreground/70 hover:text-foreground transition-all py-3 px-6 ${
									activeTab === "about" 
										? `${colorConfig.bgColor} border-border border-b-transparent -mb-[1px] text-foreground shadow-sm`
										: "bg-transparent border-border rounded-lg"
								}`}
							>
								About
							</TabsTrigger>
							<TabsTrigger 
								value="activity" 
								className={`flex-1 rounded-none border border-b-0 text-foreground/70 hover:text-foreground transition-all py-3 px-6 ${
									activeTab === "activity" 
										? `${colorConfig.bgColor} border-border border-b-transparent -mb-[1px] text-foreground shadow-sm`
										: "bg-transparent border-border rounded-lg"
								}`}
							>
								Activity
							</TabsTrigger>
						</TabsList>
					</div>
					
					<TabsContent value="about" className="mt-0 p-6">
						<ProfileAbout 
							profile={profile} 
							handleProfileUpdate={handleProfileUpdate}
							compact={true}
						/>
					</TabsContent>
					
					<TabsContent value="activity" className="mt-0 p-6">
						<ProfileActivity userPosts={userPosts} noCard={true} />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
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

			{userType === "professional" && (
				<>
					<ProfilePortfolio 
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
							<h3 className="text-lg font-semibold mb-4">Featured</h3>
							{/* Featured content */}
						</CardContent>
					</Card>
					<ProfileProducts profile={profile} />
					<ProfilePeople profile={profile} />
				</>
			)}
		</div>
	);
};

export default ProfileBoard;
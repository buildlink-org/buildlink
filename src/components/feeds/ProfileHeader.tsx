import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { MessageCircle, Edit, Settings } from "lucide-react"
import ProfileEditDialog from "../ProfileEditDialog"
import AvatarUploader from "../profile-sections/AvatarUploader"
import AccountTypeBadge from "../AccountTypeBadge"
import RatingDialog from "../RatingDialog"
import ProfileSettingsDialog from "../ProfileSettingsDialog"
import { useState } from "react"
import { UserProfile } from "@/types"
import SocialMediaLinks from "../profile/SocialMediaLinks"
import SocialLinksEditDialog from "../profile/SocialLinksEditDialog"

interface ProfileHeaderProps {
	profile: UserProfile
	uploading: boolean
	userPostsCount: number
	handleAvatarChange: (file: File) => Promise<void>
	handleAvatarRemove: () => Promise<void>
	handleProfileUpdate: () => void
}

const ProfileHeader = ({ profile, uploading, handleAvatarChange, handleAvatarRemove, handleProfileUpdate }: ProfileHeaderProps) => {
	const [showRatingDialog, setShowRatingDialog] = useState(false)
	
	// Get account-type-specific welcome config
	const getWelcomeConfig = () => {
		const userType = profile?.user_type?.toLowerCase() || "student"
		
		if (userType === "student") {
			return {
				bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
				borderColor: "border-green-200",
				titleColor: "text-green-900",
				descColor: "text-green-700",
				emoji: "😊",
				iconEmoji: "🎓",
				title: `Welcome ${profile.full_name || "User"}`,
				message: "Your journey into the industry starts right here!"
			}
		} else if (userType === "professional") {
			return {
				bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
				borderColor: "border-blue-200",
				titleColor: "text-blue-900",
				descColor: "text-blue-700",
				emoji: "😊",
				iconEmoji: "💼",
				title: `Welcome ${profile.full_name || "User"}`,
				message: "Ready to connect, grow, and lead in Kenya's built environment?"
			}
		} else if (userType === "company") {
			return {
				bgColor: "bg-gradient-to-r from-purple-50 to-pink-50",
				borderColor: "border-purple-200",
				titleColor: "text-purple-900",
				descColor: "text-purple-700",
				emoji: "😊",
				iconEmoji: "🪪",
				title: `Welcome ${profile.organization || profile.full_name || "Your Company"}`,
				message: "Relevance and Visibility has never been easier until now."
			}
		}
		
		// Default fallback (student)
		return {
			bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
			borderColor: "border-green-200",
			titleColor: "text-green-900",
			descColor: "text-green-700",
			emoji: "😊",
			iconEmoji: "🎓",
			title: `Welcome ${profile.full_name || "User"}`,
			message: "Your journey into the industry starts right here!"
		}
	}
	
	const welcomeConfig = getWelcomeConfig()
	
	return (
		<>
			<Card className={`mt-4 border ${welcomeConfig.borderColor} ${welcomeConfig.bgColor}`}>
				<CardHeader>
					<CardTitle className={welcomeConfig.titleColor}>
						Welcome, {profile.user_type === "company" ? (profile.organization || profile.full_name || "Your Company") : (profile.full_name || "User")}! {welcomeConfig.emoji}
					</CardTitle>
					<CardDescription className={welcomeConfig.descColor}>
						{welcomeConfig.message} {welcomeConfig.iconEmoji}
					</CardDescription>
				</CardHeader>
			</Card>

			<CardContent className="!mt-1 px-0 py-6">
				<div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
					{/* Info and Avatar */}
					<div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0 lg:space-x-6">
						<div className="relative">
							<AvatarUploader
								avatarUrl={profile.avatar || ""}
								fullName={profile.full_name}
								uploading={uploading}
								onAvatarChange={handleAvatarChange}
								onAvatarRemove={profile.avatar ? handleAvatarRemove : undefined}
							/>
						</div>
						<div className="flex-1">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="flex-1">
										<h1 className="mb-1 text-2xl font-bold text-foreground">{profile.full_name || "User"}</h1>
										<div className="mt-1 flex items-center gap-2">
											<AccountTypeBadge userType={profile.user_type || "student"} />
										</div>
									</div>
								</div>
								<p className="mb-1 text-base text-muted-foreground">
									{profile.profession || "No profession specified"}
									{profile.organization && <span> - {profile.organization}</span>}
								</p>
							</div>
						</div>
					</div>
					{/* Action Buttons */}
					<div className="flex flex-col gap-4 items-end">
						<div className="flex flex-col gap-2 sm:flex-row justify-end">
							<Button
								variant="outline"
								className="flex-1 sm:flex-none">
								<MessageCircle className="mr-1 h-4 w-4" />
								Message
							</Button>

							<ProfileEditDialog
								currentProfile={profile}
								onProfileUpdated={handleProfileUpdate}>
								<Button className="flex-1 sm:flex-none">
									<Edit className="mr-1 h-4 w-4" />
									Edit Profile
								</Button>
							</ProfileEditDialog>

							<ProfileSettingsDialog>
								<Button
									variant="outline"
									size="icon"
									className="flex-shrink-0">
									<Settings className="h-4 w-4" />
								</Button>
							</ProfileSettingsDialog>
						</div>
						
						{/* Social Links - Below action buttons */}
						<div className="flex items-center gap-2 flex-wrap justify-end">
							<SocialLinksEditDialog
								currentLinks={profile.social_links || {}}
								onLinksUpdated={handleProfileUpdate}
								trigger={
									<Button
										variant="outline"
										size="sm"
										className="text-xs">
										Social Links
									</Button>
								}
							/>
							<SocialMediaLinks
								links={profile.social_links || {}}
								editable={false}
							/>
						</div>
					</div>
				</div>
			</CardContent>

			<RatingDialog
				isOpen={showRatingDialog}
				onClose={() => setShowRatingDialog(false)}
				ratedUserId={profile.id}
				ratedUserName={profile.full_name}
			/>
		</>
	)
}

export default ProfileHeader

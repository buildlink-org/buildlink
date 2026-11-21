import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Edit, Settings, Share2 } from "lucide-react"
import ProfileEditDialog from "../ProfileEditDialog"
import AvatarUploader from "../profile-sections/AvatarUploader"
import AccountTypeBadge from "../AccountTypeBadge"
import RatingDialog from "../RatingDialog"
import ProfileSettingsDialog from "../ProfileSettingsDialog"
import { useState } from "react"
import { UserProfile } from "@/types"
import SocialMediaLinks from "../profile/SocialMediaLinks"
import SocialLinksEditDialog from "../profile/SocialLinksEditDialog"
import ShareProfileDialog from "../profile/ShareProfileDialog"
import VerificationBadgeButton from "./VerificationBadges"
import { getProfileSubtitle } from "@/lib/profileDisplay"

interface ProfileHeaderProps {
	profile: UserProfile
	uploading: boolean
	handleAvatarChange: (file: File) => Promise<void>
	handleAvatarRemove: () => Promise<void>
	handleProfileUpdate: () => void
}

const ProfileHeader = ({ profile, uploading, handleAvatarChange, handleAvatarRemove, handleProfileUpdate }: ProfileHeaderProps) => {
	const [showRatingDialog, setShowRatingDialog] = useState(false)

	const getWelcomeConfig = () => {
		const userType = profile?.user_type?.toLowerCase() || "student"

		if (userType === "student") {
			return {
				bgColor: "bg-student-100 dark:bg-student-900/50",
				borderColor: "border-student-200 dark:border-student-800",
				titleColor: "text-student-900 dark:text-foreground",
				descColor: "text-student-900/80 dark:text-muted-foreground",
				iconEmoji: "",
				message: "Your journey into the industry starts right here!",
			}
		} else if (userType === "professional") {
			return {
				bgColor: "bg-[#fed7aa] dark:bg-orange-950/60",
				borderColor: "border-[#fed7aa] dark:border-orange-800/50",
				titleColor: "text-black dark:text-foreground",
				descColor: "text-black/80 dark:text-muted-foreground",
				iconEmoji: "",
				message: "Ready to connect, grow and lead in Kenya’s Built Environment?",
			}
		} else if (userType === "company") {
			return {
				bgColor: "bg-green-100 dark:bg-green-950/60",
				borderColor: "border-green-200 dark:border-green-800/50",
				titleColor: "text-black dark:text-foreground",
				descColor: "text-black/80 dark:text-muted-foreground",
				iconEmoji: "",
				message: "Relevance & Visibility has never been easier until now!",
			}
		}

		// Default fallback
		return {
			bgColor: "bg-muted",
			borderColor: "border-border",
			titleColor: "text-foreground",
			descColor: "text-muted-foreground",
			iconEmoji: "🎓",
			message: "Your journey into the industry starts right here!",
		}
	}

	const welcomeConfig = getWelcomeConfig()
	const displayName = profile.user_type === "company"
		? profile.organization || profile.full_name || "Your Company"
		: profile.full_name || "User"
	const subtitle = getProfileSubtitle(profile)

	return (
		<>
			<Card className={`mt-4 border ${welcomeConfig.borderColor} ${welcomeConfig.bgColor}`}>
				<CardHeader>
					<CardTitle className={welcomeConfig.titleColor}>Welcome {displayName}!</CardTitle>
					<CardDescription className={welcomeConfig.descColor}>
						{welcomeConfig.message} {welcomeConfig.iconEmoji}
					</CardDescription>
				</CardHeader>
			</Card>

			<CardContent className="!mt-1 border-b border-border px-0 py-6">
				<div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
					{/* Info and Avatar */}
					<div className="flex gap-4 space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0 lg:space-x-6">
						<div className="relative">
							<AvatarUploader
								avatarUrl={profile.avatar || ""}
								fullName={displayName}
								uploading={uploading}
								onAvatarChange={handleAvatarChange}
								onAvatarRemove={profile.avatar ? handleAvatarRemove : undefined}
								userType={profile.user_type}
							/>
						</div>
						<div className="flex-1">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h1 className="mb-1 text-2xl font-bold text-foreground">{displayName}</h1>
											<VerificationBadgeButton profile={profile} />
										</div>
										<div className="mt-1 flex items-center gap-2">
											<AccountTypeBadge userType={profile.user_type || "student"} />
										</div>
									</div>
								</div>
								{subtitle && <p className="mb-1 text-base text-muted-foreground">{subtitle}</p>}
							</div>
						</div>
					</div>
					{/* Action Buttons */}
					<div className="flex w-full flex-row justify-end lg:w-auto">
						<div className="grid grid-cols-[2.5rem_10rem] items-center gap-x-2 gap-y-2">
							<ProfileSettingsDialog>
								<Button
									variant="outline"
									size="icon"
									className="flex-shrink-0"
									aria-label="Profile settings">
									<Settings className="h-4 w-4" />
								</Button>
							</ProfileSettingsDialog>

							<ProfileEditDialog
								currentProfile={profile}
								onProfileUpdated={handleProfileUpdate}>
								<Button className="w-full bg-red-700 text-white hover:bg-red-800">
									<Edit className="mr-1 h-4 w-4" />
									Edit Profile
								</Button>
							</ProfileEditDialog>

							<ShareProfileDialog
								profileId={profile.id}
								profileName={displayName}
								trigger={
									<Button variant="outline" size="icon" aria-label="Share profile">
										<Share2 className="h-4 w-4" />
									</Button>
								}
							/>
							<SocialLinksEditDialog
								currentLinks={profile.social_links || {}}
								onLinksUpdated={handleProfileUpdate}
								trigger={
									<Button
										variant="outline"
										className="w-full border-border text-foreground hover:bg-accent hover:text-accent-foreground dark:border-border dark:text-foreground dark:hover:bg-accent">
										Social Links
									</Button>
								}
							/>
							<span aria-hidden="true" />
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
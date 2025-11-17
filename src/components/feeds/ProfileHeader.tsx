import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { MessageCircle, Edit, Settings } from "lucide-react"
import ProfileEditDialog from "../ProfileEditDialog"
import AvatarUploader from "../profile-sections/AvatarUploader"
import AccountTypeBadge from "../AccountTypeBadge"
import RatingDialog from "../RatingDialog"
import ProfileSettingsDialog from "../ProfileSettingsDialog"
import { GraduationCap } from "lucide-react"
import { useState } from "react"
import { UserProfile } from "@/types"

interface ProfileHeaderProps {
	profile: UserProfile
	uploading: boolean
	userPostsCount: number
	handleAvatarChange: (file: File) => Promise<void>
	handleAvatarRemove: () => Promise<void>
	handleProfileUpdate: () => void
}

const ProfileHeader = ({ profile, uploading, userPostsCount, handleAvatarChange, handleAvatarRemove, handleProfileUpdate }: ProfileHeaderProps) => {
	const [showRatingDialog, setShowRatingDialog] = useState(false)
	return (
		<>
			<Card className="mt-4 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
				<CardHeader>
					<div className="flex items-center gap-2">
						<GraduationCap className="h-6 w-6 text-blue-600" />
						<CardTitle className="text-blue-900">Welcome, {profile.full_name}!</CardTitle>
					</div>
					<CardDescription className="text-blue-700">🎓 Emerging talent on the path to success. Build your network, showcase your work, and discover opportunities.</CardDescription>
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
					<div className="flex flex-col gap-2 sm:flex-row">
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

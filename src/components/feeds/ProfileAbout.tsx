import AboutSection from "../profile-sections/details/AboutSection"
import { UserProfile } from "@/types"

interface ProfileAboutProps {
	profile: UserProfile
	handleProfileUpdate: () => void
	publicProfile?: boolean
}

const ProfileAbout = ({ profile, handleProfileUpdate, publicProfile }: ProfileAboutProps) => {
	return (
		<div className="flex h-full flex-col space-y-4">
			<div className="flex-1">
				<AboutSection
					publicProfile={publicProfile}
					profile={profile}
					handleProfileUpdate={handleProfileUpdate}
					noCard={true}
				/>
			</div>
		</div>
	)
}

export default ProfileAbout

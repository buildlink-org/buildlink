import AboutSection from "../profile-sections/details/AboutSection"
import PortfolioSection from "../profile-sections/details/PortfolioSection"
import ExperienceSection from "../profile-sections/details/ExperienceSection"
import EducationSection from "../profile-sections/details/EducationSection"
import CertificationsSection from "../profile-sections/details/CertificationsSection"
import CompactSkillsSection from "../profile-sections/details/CompactSkillsSection"
import SocialMediaLinks from "../profile/SocialMediaLinks"
import SocialLinksEditDialog from "../profile/SocialLinksEditDialog"
import VerificationBadges from "../profile/VerificationBadges"
import AccountTypeDashboard from "../AccountTypeDashboard"
import { UserProfile } from "@/types"

interface ProfileAboutProps {
	profile: UserProfile
	handleProfileUpdate: () => void
	compact?: boolean
}

const ProfileAbout = ({ profile, handleProfileUpdate, compact = false }: ProfileAboutProps) => {
	// If compact mode, only show AboutSection without card wrapper
	if (compact) {
		return (
			<div className="space-y-4 h-full flex flex-col">
				<div className="flex-1">
					<AboutSection
						profile={profile}
						handleProfileUpdate={handleProfileUpdate}
						noCard={true}
					/>
				</div>
			</div>
		)
	}

	// Full mode - show everything
	return (
		<div className="space-y-6">
			{/* Account Type Dashboard */}
			<AccountTypeDashboard profile={profile} />

			{/* Verification Badges */}
			{profile.verification_badges && profile.verification_badges.length > 0 && (
				<div className="space-y-2">
					<h3 className="font-semibold">Verification Badges</h3>
					<VerificationBadges 
						badges={Array.isArray(profile.verification_badges) && typeof profile.verification_badges[0] === 'string'
							? profile.verification_badges.map(badge => ({
								type: badge,
								label: badge,
								description: `${badge} verified`,
								verified_at: new Date().toISOString()
							}))
							: (profile.verification_badges as any)
						} 
					/>
				</div>
			)}

			{/* Remove Social Links section - now in header */}

			<AboutSection
				profile={profile}
				handleProfileUpdate={handleProfileUpdate}
			/>
			<PortfolioSection
				profile={profile}
				handleProfileUpdate={handleProfileUpdate}
			/>
			<ExperienceSection
				profile={profile}
				handleProfileUpdate={handleProfileUpdate}
			/>
			<EducationSection
				profile={profile}
				handleProfileUpdate={handleProfileUpdate}
			/>
			<CompactSkillsSection
				profile={profile}
				handleProfileUpdate={handleProfileUpdate}
			/>
			<CertificationsSection
				profile={profile}
				handleProfileUpdate={handleProfileUpdate}
			/>
		</div>
	)
}

export default ProfileAbout

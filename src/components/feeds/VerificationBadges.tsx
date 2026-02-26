import { UserProfile } from "@/types"
import VerificationBadges from "../profile/VerificationBadges"

const VerificationBadgeButton = ({ profile }: { profile: UserProfile }) => {
	return (
		<>
			{/* Verification Badges */}
			{profile.verification_badges && profile.verification_badges.length > 0 && (
				<div className="space-y-2">
					{/* <h3 className="font-semibold">Verification Badges</h3> */}
					<VerificationBadges
						badges={
							Array.isArray(profile.verification_badges) && typeof profile.verification_badges[0] === "string"
								? profile.verification_badges.map((badge) => ({
										type: badge,
										label: badge,
										description: `${badge} verified`,
										verified_at: new Date().toISOString(),
									}))
								: (profile.verification_badges as any)
						}
					/>
				</div>
			)}
		</>
	)
}

export default VerificationBadgeButton

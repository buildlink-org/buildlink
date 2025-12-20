import { Card, CardContent } from "@/components/ui/card"
import { convertAndSanitizeSkills } from "@/lib/skillUtils"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import SkillsEditDialog from "@/components/profile-sections/SkillsEditDialog"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/types"

interface CompactSkillsSectionProps {
	profile: UserProfile
	handleProfileUpdate: () => void
	canEdit?: boolean
}

const levelToPercent = (level: number): number => {
	// Level 1: 20%, Level 2: 40%, ..., Level 5: 100%
	return Math.max(1, Math.min(5, level)) * 20
}

const CompactSkillsSection = ({ profile, handleProfileUpdate, canEdit = true }: CompactSkillsSectionProps) => {
	const skills = convertAndSanitizeSkills(profile?.skills || [])

	const userType = profile.user_type?.toLowerCase() || "student"

	let badgeClasses = "bg-yellow-100 text-black-200 border border-yellow-200"
	if (userType === "professional") {
		badgeClasses = "bg-[#FFCBA4] text-black-200 border border-orange-200"
	} else if (userType === "company") {
		badgeClasses = "bg-green-100 text-green-900 border border-green-200"
	}

	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="rounded-md px-4 py-4 shadow-md">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-base font-semibold text-gray-800">Skills</h2>
					{canEdit && (
						<SkillsEditDialog
							currentProfile={profile}
							onProfileUpdated={handleProfileUpdate}>
							<Button
								variant="ghost"
								size="sm"
								className="px-2"
								aria-label="Edit skills"
								type="button">
								<Edit className="h-4 w-4" />
							</Button>
						</SkillsEditDialog>
					)}
				</div>
				<div className="space-y-3">
					{skills.length === 0 ? (
						<div className="italic text-gray-500">No skills added yet.</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{skills.map((skill, idx) => (
								<Badge
									key={idx}
									variant="secondary"
									className={`${badgeClasses} px-3 py-1 text-sm transition-colors hover:brightness-95`}>
									{skill.name}
								</Badge>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default CompactSkillsSection

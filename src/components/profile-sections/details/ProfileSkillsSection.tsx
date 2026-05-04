import { Card, CardContent } from "@/components/ui/card"
import { convertAndSanitizeSkills } from "@/lib/skillUtils"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import SkillsEditDialog from "@/components/profile-sections/SkillsEditDialog"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/types"

interface CompactSkillsSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	canEdit?: boolean
}

const levelToPercent = (level: number): number => {
	// Level 1: 20%, Level 2: 40%, ..., Level 5: 100%
	return Math.max(1, Math.min(5, level)) * 20
}

const ProfileSkillsSection = ({ profile, handleProfileUpdate, canEdit = false }: CompactSkillsSectionProps) => {
	const skills = convertAndSanitizeSkills(profile?.skills || [])

	const userType = profile.user_type?.toLowerCase() || "student"

	
	let badgeClasses = "bg-yellow-100 dark:bg-yellow-950 text-foreground border border-yellow-200 dark:border-yellow-800"
	if (userType === "professional") {
	badgeClasses = "bg-orange-200 dark:bg-orange-950 text-foreground border border-orange-200 dark:border-orange-800"
	} else if (userType === "company") {
	badgeClasses = "bg-green-100 dark:bg-green-950 text-foreground border border-green-200 dark:border-green-800"
	}

	if (!canEdit && skills.length === 0) return null

	return (
		<Card className="border border-border shadow-sm">
			<CardContent className="rounded-md px-4 py-4 shadow-sm">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-base font-semibold text-foreground">Skills</h2>
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
								variant="outline"
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

export default ProfileSkillsSection

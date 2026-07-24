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

	
	let badgeClasses = "bg-[#fde68a] dark:bg-yellow-900 text-foreground border border-yellow-300 dark:border-yellow-700"
	if (userType === "professional") {
	badgeClasses = "bg-[#fed7aa] dark:bg-orange-950 text-foreground border border-orange-200 dark:border-orange-800"
	} else if (userType === "company") {
	badgeClasses = "bg-green-100 dark:bg-green-950 text-foreground border border-green-200 dark:border-green-800"
	}

	return (
		<Card className="border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
			<CardContent className="px-4 py-4">
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-base font-semibold text-foreground">{userType === "company" ? "Expertise" : "Skills"}</h2>
						{skills.length > 0 && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{skills.length}</span>
						)}
					</div>
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
						<div className="flex flex-col items-center justify-center py-6 text-center">
							<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
								<Edit className="h-5 w-5 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground">
								{canEdit ? "No skills added yet. Click edit to showcase your skills." : "This user hasn't listed any skills yet."}
							</p>
						</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{skills.map((skill, idx) => (
								<Badge
								key={idx}
								variant="outline"
								className={`${badgeClasses} px-3 py-1.5 text-sm font-medium transition-all hover:scale-105 hover:shadow-sm cursor-default`}>
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

export default ProfileSkillsSection;

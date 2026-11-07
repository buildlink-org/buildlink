import { Card, CardContent } from "@/components/ui/card"
import { convertAndSanitizeSkills, Skill } from "@/lib/skillUtils"
import { Badge } from "@/components/ui/badge"
import SkillsEditDialog from "@/components/profile-sections/SkillsEditDialog"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/types"
import EditIconButton from "@/components/profile/EditIconButton"

interface CompactSkillsSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	canEdit?: boolean
}

const ProfileSkillsSection = ({ profile, handleProfileUpdate, canEdit = false }: CompactSkillsSectionProps) => {
	const skills: Skill[] = convertAndSanitizeSkills(profile?.skills || []).slice(0, 5)

	const userType = profile.user_type?.toLowerCase() || "student"

	let badgeClasses = "bg-[#fde68a] dark:bg-yellow-900 text-foreground border border-yellow-300 dark:border-yellow-700"
	if (userType === "professional") {
		badgeClasses = "bg-[#fed7aa] dark:bg-orange-950 text-foreground border border-orange-200 dark:border-orange-800"
	} else if (userType === "company") {
		badgeClasses = "bg-green-100 dark:bg-green-950 text-foreground border border-green-200 dark:border-green-800"
	}

	const renderChip = (skill: Skill) => (
		<Badge
			key={skill.name}
			variant="outline"
			className={`${badgeClasses} cursor-default px-2.5 py-1 text-xs font-medium`}>
			{skill.name}
		</Badge>
	)

	return (
		<Card className="border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
			<CardContent className="px-3 py-3">
				<div className="mb-2 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-base font-semibold text-foreground">{userType === "company" ? "Expertise" : "Skills"}</h2>
						{skills.length > 0 && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
								{skills.length} {skills.length === 1 ? "skill" : "skills"}
							</span>
						)}
					</div>
					{canEdit && (
						<SkillsEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
							<EditIconButton label="Edit skills" />
						</SkillsEditDialog>
					)}
				</div>
				{skills.length === 0 ? (
					<div className="flex items-center justify-between gap-3">
						<p className="text-xs text-muted-foreground">No skills listed yet.</p>
						{canEdit && (
							<SkillsEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
								<Button variant="outline" size="sm" className="h-8">Edit skills</Button>
							</SkillsEditDialog>
						)}
					</div>
				) : (
					<div className="flex flex-wrap gap-1.5">
						{skills.map(renderChip)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default ProfileSkillsSection
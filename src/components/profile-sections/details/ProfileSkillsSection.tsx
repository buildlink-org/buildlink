import { Card, CardContent } from "@/components/ui/card"
import { convertAndSanitizeSkills, Skill } from "@/lib/skillUtils"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import SkillsEditDialog from "@/components/profile-sections/SkillsEditDialog"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/types"
import EmptyState from "@/components/profile/EmptyState"
import EditIconButton from "@/components/profile/EditIconButton"

interface CompactSkillsSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	canEdit?: boolean
}

/** Built-environment tool keywords used to split tools from professional skills. */
const TOOL_KEYWORDS = [
	"autocad", "revit", "bim", "cad", "gis", "archicad", "sketchup", "rhino",
	"civil 3d", "etabs", "sap", "prokon", "ms project", "primavera", "figma",
	"3d", "photoshop", "illustrator", "excel", "modelling", "modeling", "visualization",
]

const isTool = (name: string): boolean => {
	const lower = name.toLowerCase()
	return TOOL_KEYWORDS.some((kw) => lower.includes(kw))
}

const ProfileSkillsSection = ({ profile, handleProfileUpdate, canEdit = false }: CompactSkillsSectionProps) => {
	const skills: Skill[] = convertAndSanitizeSkills(profile?.skills || [])

	const userType = profile.user_type?.toLowerCase() || "student"

	let badgeClasses = "bg-[#fde68a] dark:bg-yellow-900 text-foreground border border-yellow-300 dark:border-yellow-700"
	if (userType === "professional") {
		badgeClasses = "bg-[#fed7aa] dark:bg-orange-950 text-foreground border border-orange-200 dark:border-orange-800"
	} else if (userType === "company") {
		badgeClasses = "bg-green-100 dark:bg-green-950 text-foreground border border-green-200 dark:border-green-800"
	}

	// Top skills (first three) get featured treatment; tools are grouped separately
	const topSkills = skills.slice(0, 3)
	const remaining = skills.slice(3)
	const tools = remaining.filter((s) => isTool(s.name))
	const professionalSkills = remaining.filter((s) => !isTool(s.name))

	const renderChip = (skill: Skill, featured = false) => (
		<Badge
			key={skill.name}
			variant="outline"
			className={`${badgeClasses} px-3 py-1.5 text-sm font-medium transition-all hover:scale-105 hover:shadow-sm cursor-default ${
				featured ? "ring-1 ring-primary/40" : ""
			}`}>
			{featured && <Sparkles className="mr-1 inline h-3 w-3" aria-hidden="true" />}
			{skill.name}
		</Badge>
	)

	return (
		<Card className="border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
			<CardContent className="px-4 py-4">
				<div className="mb-3 flex items-center justify-between">
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
					<EmptyState
						icon={<Sparkles className="h-5 w-5" />}
						title="Add your skills"
						description="Add the tools and professional skills you use most. Skills help people discover you for relevant projects and opportunities."
						action={canEdit ? (
							<SkillsEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
								<Button variant="outline">Add skills</Button>
							</SkillsEditDialog>
						) : undefined}
					/>
				) : (
					<div className="space-y-3">
						{/* Top skills — featured treatment (report §6.1) */}
						<div className="flex flex-wrap gap-2">{topSkills.map((s) => renderChip(s, true))}</div>
						{tools.length > 0 && (
							<div>
								<p className="mb-1.5 text-xs font-medium text-muted-foreground">Tools & software</p>
								<div className="flex flex-wrap gap-2">{tools.map((s) => renderChip(s))}</div>
							</div>
						)}
						{professionalSkills.length > 0 && (
							<div>
								<p className="mb-1.5 text-xs font-medium text-muted-foreground">Professional skills</p>
								<div className="flex flex-wrap gap-2">{professionalSkills.map((s) => renderChip(s))}</div>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default ProfileSkillsSection
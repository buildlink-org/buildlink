import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import SkillsEditDialog from "@/components/profile-sections/SkillsEditDialog"
import { convertAndSanitizeSkills } from "@/lib/skillUtils"
import { UserProfile } from "@/types"

interface SkillsSectionProps {
	profile: UserProfile
	handleProfileUpdate: () => void
}

const SkillsSection = ({ profile, handleProfileUpdate }: SkillsSectionProps) => {
	const renderSkillsContent = () => {
		const sanitizedSkills = convertAndSanitizeSkills(profile?.skills || [])
		if (sanitizedSkills.length === 0) {
			return <div className="py-4 italic text-gray-500">No skills added yet. Click edit to showcase your expertise and specializations.</div>
		}

		return (
			<div className="space-y-4">
				{sanitizedSkills.map((skill, index) => {
					return (
						<div
							key={index}
							className="flex animate-fade-in items-center space-x-4">
							<span className="flex-1 truncate font-medium text-gray-900">{skill.name}</span>
						</div>
					)
				})}
			</div>
		)
	}

	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="px-4 py-4 shadow-md">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h2 className="mb-1 text-lg font-semibold text-gray-800">Skills & Specialization</h2>
						<p className="text-sm text-gray-500">Showcase your expertise and experience levels</p>
					</div>
					<SkillsEditDialog
						currentProfile={profile}
						onProfileUpdated={handleProfileUpdate}>
						<Button
							variant="ghost"
							size="sm">
							<Edit className="h-4 w-4" />
						</Button>
					</SkillsEditDialog>
				</div>
				{renderSkillsContent()}
			</CardContent>
		</Card>
	)
}

export default SkillsSection

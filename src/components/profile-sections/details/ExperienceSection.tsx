import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Briefcase, ChevronDown, ChevronUp } from "lucide-react"
import ExperienceEditDialog from "@/components/profile-sections/ExperienceEditDialog"
import { UserProfile } from "@/types"

interface ExperienceSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	maxVisible?: number
	canEdit?: boolean
}

const ExperienceSection = ({ profile, handleProfileUpdate, maxVisible, canEdit = false }: ExperienceSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const experiences = profile.experiences || []
	const defaultLimit = 2
	const limit = isExpanded ? experiences.length : defaultLimit
	const visibleExperiences = experiences.slice(0, limit)
	const hasMore = experiences.length > defaultLimit

	const userType = profile.user_type?.toLowerCase() || "student"
	let iconBg = "bg-yellow-100"
	let iconText = "text-yellow-700"
	if (userType === "professional") {
		iconBg = "bg-orange-100"
		iconText = "text-orange-700"
	} else if (userType === "company") {
		iconBg = "bg-green-100"
		iconText = "text-green-700"
	}

	if (!canEdit && experiences.length === 0) return null

	return (
		<Card className="rounded-lg border border-border shadow-sm">
			<CardContent className="px-4 py-4">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-800">Professional Experience (optional)</h2>
					{canEdit && (
						<ExperienceEditDialog
							currentProfile={profile}
							onProfileUpdated={handleProfileUpdate}>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0">
								<Edit className="h-4 w-4" />
							</Button>
						</ExperienceEditDialog>
					)}
				</div>
				<div className="space-y-4">
					{experiences.length > 0 ? (
						<>
							{visibleExperiences.map((exp: any, index: number) => (
								<div
									key={index}
									className="flex space-x-4">
									<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
										<Briefcase className={`h-6 w-6 ${iconText}`} />
									</div>
									<div className="min-w-0 flex-1">
										<h3 className="font-semibold text-gray-900">{exp.title || "[Internship/Role]"}</h3>
										<p className="text-gray-600">{exp.company || "[Organization/Company]"}</p>
										<p className="text-sm text-gray-500">{exp.duration || exp.timeline || "[Timeline]"}</p>
										{exp.description && <p className="mt-2 text-sm text-gray-700">{exp.description}</p>}
									</div>
								</div>
							))}
							{hasMore && (
								<button
									type="button"
									className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
									onClick={() => setIsExpanded(!isExpanded)}>
									{isExpanded ? (
										<>
											<ChevronUp className="h-4 w-4" />
											Read less
										</>
									) : (
										<>
											<ChevronDown className="h-4 w-4" />
											Read more ({experiences.length - defaultLimit} more)
										</>
									)}
								</button>
							)}
						</>
					) : (
						<p className="text-gray-500">No experience added yet. Click edit to add your work experience.</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default ExperienceSection

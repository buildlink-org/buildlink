import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, GraduationCap, ChevronDown, ChevronUp } from "lucide-react"
import EducationEditDialog from "@/components/profile-sections/EducationEditDialog"
import { Education, UserProfile } from "@/types"
import ReadMoreText from "@/components/ReadMore"

interface EducationSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	maxVisible?: number
	canEdit?: boolean
}

const EducationSection = ({ profile, handleProfileUpdate, maxVisible, canEdit = false }: EducationSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const education = profile.education || []
	const defaultLimit = 2
	const limit = isExpanded ? education.length : defaultLimit
	const visibleEducation = education.slice(0, limit)
	const hasMore = education.length > defaultLimit

	const userType = profile.user_type?.toLowerCase() || "student"
		let iconBg = "bg-yellow-100 dark:bg-yellow-950"
		let iconText = "text-yellow-700 dark:text-yellow-200"
		if (userType === "professional") {
		iconBg = "bg-orange-100 dark:bg-orange-950"
		iconText = "text-orange-700 dark:text-orange-300"
		} else if (userType === "company") {
		iconBg = "bg-green-100 dark:bg-green-950"
		iconText = "text-green-700 dark:text-green-400"
		}

	if (!canEdit && education.length === 0) return null
	return (
		<Card className="rounded-lg border border-border shadow-sm">
			<CardContent className="px-4 py-4">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-foreground">Education & Training</h2>
					{canEdit && (
						<EducationEditDialog
							currentProfile={profile}
							onProfileUpdated={handleProfileUpdate}>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0">
								<Edit className="h-4 w-4" />
							</Button>
						</EducationEditDialog>
					)}
				</div>
				<div className="space-y-4">
					{education.length > 0 ? (
						<>
							{visibleEducation.map((edu: Education, index: number) => (
								<div
									key={index}
									className="flex space-x-4">
									<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
										<GraduationCap className={`h-6 w-6 ${iconText}`} />
									</div>
									<div className="min-w-0 flex-1">
										<h3 className="font-semibold text-foreground">{edu.degree || "[Degree/Certificate]"}</h3>
										<p className="text-muted-foreground">{edu.institution || "[Institution]"}</p>
										<p className="text-sm text-muted-foreground">{edu.year || "[Year]"}</p>
										{edu.description && (
											<p className="mt-2 text-sm text-muted-foreground">
												<ReadMoreText
													text={edu.description}
													maxLength={300}
												/>
											</p>
										)}
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
											Read more ({education.length - defaultLimit} more)
										</>
									)}
								</button>
							)}
						</>
					) : (
						<p className="text-muted-foreground">No education added yet. Click edit to add your educational background.</p>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default EducationSection

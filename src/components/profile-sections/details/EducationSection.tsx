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
		<Card className="rounded-lg border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
			<CardContent className="px-4 py-4">
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">Education & Training</h2>
						{education.length > 0 && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{education.length}</span>
						)}
					</div>
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
				<div className="space-y-1">
					{education.length > 0 ? (
						<>
							{visibleEducation.map((edu: Education, index: number) => (
								<div
									key={index}
									className="relative flex gap-4 pb-6 last:pb-0">
									{/* Timeline line */}
									{index < visibleEducation.length - 1 && (
										<div className="absolute left-6 top-14 bottom-0 w-px bg-border" />
									)}
									<div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm`}>
										<GraduationCap className={`h-6 w-6 ${iconText}`} />
									</div>
									<div className="min-w-0 flex-1 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border hover:shadow-sm">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 flex-1">
												<h3 className="font-semibold text-foreground">{edu.degree || "[Degree/Certificate]"}</h3>
												<p className="text-sm text-muted-foreground">{edu.institution || "[Institution]"}</p>
											</div>
											{edu.year && (
												<span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
													{edu.year}
												</span>
											)}
										</div>
										{(!edu.year) && (
											<p className="mt-0.5 text-sm text-muted-foreground">[Year]</p>
										)}
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
									className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 mt-2"
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
						<div className="flex flex-col items-center justify-center py-6 text-center">
							<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
								<GraduationCap className="h-5 w-5 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground">No education added yet. Click edit to add your educational background.</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default EducationSection

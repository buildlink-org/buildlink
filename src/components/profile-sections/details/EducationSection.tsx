import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, ChevronDown, ChevronUp, Plus } from "lucide-react"
import EducationEditDialog from "@/components/profile-sections/EducationEditDialog"
import { Education, UserProfile } from "@/types"
import ReadMoreText from "@/components/ReadMore"
import EmptyState from "@/components/profile/EmptyState"
import EditIconButton from "@/components/profile/EditIconButton"

interface EducationSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	maxVisible?: number
	canEdit?: boolean
}

/** Build a display period from the supported fields (year or start/end dates). */
const educationDate = (edu: Education): string | null => {
	if (edu.year) return String(edu.year)
	const start = edu.startDate
	const end = edu.endDate
	if (start || end) return [start, end].filter(Boolean).join(" – ")
	return null
}

const EducationSection = ({ profile, handleProfileUpdate, maxVisible, canEdit = false }: EducationSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const education = (profile.education || []).filter(
		(edu) => edu?.degree || edu?.institution || edu?.description
	)
	const defaultLimit = 2
	const limit = isExpanded ? education.length : (maxVisible ?? defaultLimit)
	const visibleEducation = education.slice(0, limit)
	const hasMore = education.length > limit
	const hiddenCount = education.length - limit

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
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
								{education.length} {education.length === 1 ? "entry" : "entries"}
							</span>
						)}
					</div>
					{canEdit && (
						<EducationEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
							<EditIconButton label="Edit education" />
						</EducationEditDialog>
					)}
				</div>
				<div className="space-y-1">
					{education.length > 0 ? (
						<>
							{visibleEducation.map((edu, index) => {
								const period = educationDate(edu)
								if (!edu.degree && !edu.institution && !edu.description) return null
								return (
									<div
										key={`${edu.degree || edu.institution || "edu"}-${index}`}
										className="relative flex gap-4 pb-6 last:pb-0">
										{/* Timeline line */}
										{index < visibleEducation.length - 1 && (
											<div className="absolute left-6 top-14 bottom-0 w-px bg-border" />
										)}
										<div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm`}>
											<GraduationCap className={`h-6 w-6 ${iconText}`} aria-hidden="true" />
										</div>
										<div className="min-w-0 flex-1 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border hover:shadow-sm">
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0 flex-1">
													{edu.degree && <h3 className="font-semibold text-foreground">{edu.degree}</h3>}
													{edu.institution && <p className="text-sm text-muted-foreground">{edu.institution}</p>}
													{edu.fieldOfStudy && (
														<p className="text-xs text-muted-foreground">Field of study: {edu.fieldOfStudy}</p>
													)}
												</div>
												{period && (
													<span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
														{period}
													</span>
												)}
											</div>
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
								)
							})}
							{hasMore && (
								<button
									type="button"
									className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 mt-2"
									onClick={() => setIsExpanded(!isExpanded)}
									aria-expanded={isExpanded}>
									{isExpanded ? (
										<><ChevronUp className="h-4 w-4" /> Read less</>
									) : (
										<><ChevronDown className="h-4 w-4" /> Read more ({hiddenCount} more)</>
									)}
								</button>
							)}
						</>
					) : (
						<EmptyState
							icon={<GraduationCap className="h-5 w-5" />}
							title="Add your education"
							description="Add your programme, institution, and study period. Education entries help you build credibility early in your career."
							action={canEdit ? (
								<EducationEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
									<Button variant="outline" className="gap-2">
										<Plus className="h-4 w-4" /> Add education
									</Button>
								</EducationEditDialog>
							) : undefined}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default EducationSection
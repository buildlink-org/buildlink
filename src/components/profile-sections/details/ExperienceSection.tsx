import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, ChevronDown, ChevronUp, Plus } from "lucide-react"
import ExperienceEditDialog from "@/components/profile-sections/ExperienceEditDialog"
import { Experiences, UserProfile } from "@/types"
import ReadMoreText from "@/components/ReadMore"
import EmptyState from "@/components/profile/EmptyState"
import EditIconButton from "@/components/profile/EditIconButton"

interface ExperienceSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	maxVisible?: number
	canEdit?: boolean
}

/** Build a display date from the supported fields (legacy + current). */
const experienceDate = (exp: Experiences): string | null => {
	const e = exp as Record<string, string | undefined>
	const start = e.startDate || e.start_date
	const end = e.endDate || e.end_date
	if (start || end) return [start, end].filter(Boolean).join(" – ")
	return e.duration || e.timeline || null
}

const ExperienceSection = ({ profile, handleProfileUpdate, maxVisible, canEdit = false }: ExperienceSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const experiences = (profile.experiences || []).filter(
		(exp) => exp?.title || exp?.company || exp?.description
	)
	const defaultLimit =2
	const limit = isExpanded ? experiences.length : (maxVisible ?? defaultLimit)
	const visibleExperiences = experiences.slice(0, limit)
	const hasMore = experiences.length > limit
	const hiddenCount = experiences.length - limit

	const userType = profile.user_type?.toLowerCase() || "student"
	let iconBg = "bg-student-100 dark:bg-yellow-950"
	let iconText = "text-student-700 dark:text-yellow-200"
	if (userType === "professional") {
		iconBg = "bg-professional-100 dark:bg-orange-950"
		iconText = "text-professional-700 dark:text-orange-300"
	} else if (userType === "company") {
		iconBg = "bg-company-100 dark:bg-green-950"
		iconText = "text-company-700 dark:text-green-400"
	}

	if (!canEdit && experiences.length ===0 && profile.user_type !== "student") return null

	return (
		<Card className="rounded-lg border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
			<CardContent className="px-4 py-4">
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">Professional Experience</h2>
						{experiences.length > 0 && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
								{experiences.length} {experiences.length ===1 ? "entry" : "entries"}
							</span>
						)}
					</div>
					{canEdit && (
						<ExperienceEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
							<EditIconButton label="Edit experience" />
						</ExperienceEditDialog>
					)}
				</div>
				<div className="space-y-1">
					{experiences.length > 0 ? (
						<>
							{visibleExperiences.map((exp, index) => {
								const date = experienceDate(exp)
								if (!exp.title && !exp.company && !exp.description) return null
								return (
									<div
										key={exp.title + "-" + index}
										className="relative flex gap-4 pb-6 last:pb-0">
										{/* Timeline line */}
										{index < visibleExperiences.length - 1 && (
											<div className="absolute left-6 top-14 bottom-0 w-px bg-border" />
										)}
										<div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm`}>
											<Briefcase className={`h-6 w-6 ${iconText}`} aria-hidden="true" />
										</div>
										<div className="min-w-0 flex-1 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border hover:shadow-sm">
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0 flex-1">
													{exp.title && <h3 className="font-semibold text-foreground">{exp.title}</h3>}
													{exp.company && <p className="text-sm text-muted-foreground">{exp.company}</p>}
												</div>
												{date && (
													<span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
														{date}
													</span>
												)}
											</div>
											{exp.description && (
												<p className="mt-2 text-sm text-muted-foreground">
													<ReadMoreText
														text={exp.description}
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
							icon={<Briefcase className="h-5 w-5" />}
							title="Add your experience"
							description="Add your current role or most relevant experience. Focus on what you contributed and what you learned."
							action={canEdit ? (
								<ExperienceEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
									<Button variant="outline" className="gap-2">
										<Plus className="h-4 w-4" /> Add experience
									</Button>
								</ExperienceEditDialog>
							) : undefined}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default ExperienceSection
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Briefcase, ChevronDown, ChevronUp } from "lucide-react"
import ExperienceEditDialog from "@/components/profile-sections/ExperienceEditDialog"
import { UserProfile } from "@/types"
import ReadMoreText from "@/components/ReadMore"

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
	let iconBg = "bg-student-100 dark:bg-yellow-950"
	let iconText = "text-student-700 dark:text-yellow-200"
	if (userType === "professional") {
		iconBg = "bg-professional-100 dark:bg-orange-950"
		iconText = "text-professional-700 dark:text-orange-300"
	} else if (userType === "company") {
		iconBg = "bg-company-100 dark:bg-green-950"
		iconText = "text-company-700 dark:text-green-400"
	}

	if (!canEdit && experiences.length === 0 && profile.user_type !== "student") return null

	return (
		<Card className="rounded-lg border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
			<CardContent className="px-4 py-4">
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">Professional Experience</h2>
						{experiences.length > 0 && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{experiences.length}</span>
						)}
					</div>
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
				<div className="space-y-1">
					{experiences.length > 0 ? (
						<>
							{visibleExperiences.map((exp: any, index: number) => (
								<div
									key={index}
									className="relative flex gap-4 pb-6 last:pb-0">
									{/* Timeline line */}
									{index < visibleExperiences.length - 1 && (
										<div className="absolute left-6 top-14 bottom-0 w-px bg-border" />
									)}
									<div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm`}>
										<Briefcase className={`h-6 w-6 ${iconText}`} />
									</div>
									<div className="min-w-0 flex-1 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border hover:shadow-sm">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 flex-1">
												<h3 className="font-semibold text-foreground">{exp.title || "[Internship/Role]"}</h3>
												<p className="text-sm text-muted-foreground">{exp.company || "[Organization/Company]"}</p>
											</div>
											{exp.duration && (
												<span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
													{exp.duration || exp.timeline || "[Timeline]"}
												</span>
											)}
										</div>
										{(!exp.duration) && (
											<p className="mt-0.5 text-sm text-muted-foreground">{exp.timeline || "[Timeline]"}</p>
										)}
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
											Read more ({experiences.length - defaultLimit} more)
										</>
									)}
								</button>
							)}
						</>
					) : (
						(profile.user_type === "professional" || profile.user_type === "student") ? (
							<div className="flex gap-4">
								<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${profile.user_type === "student" ? "bg-[#fde68a] dark:bg-yellow-950/60" : "bg-[#fed7aa] dark:bg-orange-950/60"} shadow-sm`} />
								<div className="min-w-0 flex-1 space-y-1 rounded-lg border border-border/50 bg-card/50 p-3">
									<h3 className="font-bold text-foreground leading-tight">{profile.user_type === "student" ? "[Internship/Role]" : "[Job Title]"}</h3>
									<p className="text-sm text-muted-foreground leading-tight">[Organization/Company]</p>
									<p className="text-sm text-muted-foreground leading-tight">[Timeline]</p>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-6 text-center">
								<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
									<Briefcase className="h-5 w-5 text-muted-foreground" />
								</div>
								<p className="text-sm text-muted-foreground">No experience added yet. Click edit to add your work experience.</p>
							</div>
						)
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default ExperienceSection

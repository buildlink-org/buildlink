import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Award, ChevronDown, ChevronUp } from "lucide-react"
import CertificationsEditDialog from "@/components/profile-sections/CertificationsEditDialog"
import { UserProfile } from "@/types"
import ReadMoreText from "@/components/ReadMore"

interface CertificationsSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	maxVisible?: number
	canEdit?: boolean
}

const CertificationsSection = ({ profile, handleProfileUpdate, maxVisible, canEdit = false }: CertificationsSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const certifications = profile.certifications || []
	const defaultLimit = 2
	const limit = isExpanded ? certifications.length : defaultLimit
	const visibleCerts = certifications.slice(0, limit)
	const hasMore = certifications.length > defaultLimit

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

	if (!canEdit && certifications.length === 0) return null
	return (
		<Card className="rounded-lg border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
			<CardContent className="px-4 py-4">
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">Licence & Certifications</h2>
						{certifications.length > 0 && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{certifications.length}</span>
						)}
					</div>
					{canEdit && (
						<CertificationsEditDialog
							currentProfile={profile}
							onProfileUpdated={handleProfileUpdate}>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0">
								<Edit className="h-4 w-4" />
							</Button>
						</CertificationsEditDialog>
					)}
				</div>
				<div className="space-y-1">
					{certifications.length > 0 ? (
						<>
							{visibleCerts.map((cert: any, index: number) => (
								<div
									key={index}
									className="relative flex gap-4 pb-6 last:pb-0">
									{/* Timeline line */}
									{index < visibleCerts.length - 1 && (
										<div className="absolute left-6 top-14 bottom-0 w-px bg-border" />
									)}
									<div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm`}>
										<Award className={`h-6 w-6 ${iconText}`} />
									</div>
									<div className="min-w-0 flex-1 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border hover:shadow-sm">
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 flex-1">
												<h3 className="font-semibold text-foreground">{cert.name || "[Certification Name]"}</h3>
												<p className="text-sm text-muted-foreground">{cert.issuer || "[Issuing Organization]"}</p>
											</div>
											{cert.date && (
												<span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
													{cert.date}
												</span>
											)}
										</div>
										{(!cert.date) && (
											<p className="mt-0.5 text-sm text-muted-foreground">[Date]</p>
										)}
										{cert.credential_id && (
											<p className="mt-1 text-xs text-muted-foreground">
												Credential ID: <span className="font-mono">{cert.credential_id}</span>
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
											Read more ({certifications.length - defaultLimit} more)
										</>
									)}
								</button>
							)}
						</>
					) : (
						<div className="flex flex-col items-center justify-center py-6 text-center">
							<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
								<Award className="h-5 w-5 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground">No certifications added yet. Click edit to add your certifications.</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default CertificationsSection

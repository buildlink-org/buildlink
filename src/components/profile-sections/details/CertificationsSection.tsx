import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, BadgeCheck, ChevronDown, ChevronUp, Plus } from "lucide-react"
import CertificationsEditDialog from "@/components/profile-sections/CertificationsEditDialog"
import { UserProfile } from "@/types"
import ReadMoreText from "@/components/ReadMore"
import EmptyState from "@/components/profile/EmptyState"
import EditIconButton from "@/components/profile/EditIconButton"

interface CertificationsSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	maxVisible?: number
	canEdit?: boolean
}

/** Legacy + current credential shape. */
type Cert = {
	name?: string
	issuer?: string
	date?: string
	description?: string
	credential_id?: string
	url?: string
	credential_url?: string
}

const CertificationsSection = ({ profile, handleProfileUpdate, maxVisible, canEdit = false }: CertificationsSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const certifications = ((profile.certifications || []) as Cert[]).filter(
		(cert) => cert && (cert.name || cert.issuer)
	)
	const defaultLimit = 2
	const limit = isExpanded ? certifications.length : (maxVisible ?? defaultLimit)
	const visibleCerts = certifications.slice(0, limit)
	const hasMore = certifications.length > limit
	const hiddenCount = certifications.length - limit

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
						<h2 className="text-lg font-semibold text-foreground">Licences & Certifications</h2>
						{certifications.length > 0 && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
								{certifications.length} {certifications.length === 1 ? "credential" : "credentials"}
							</span>
						)}
					</div>
					{canEdit && (
						<CertificationsEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
							<EditIconButton label="Edit certifications" />
						</CertificationsEditDialog>
					)}
				</div>
				<div className="space-y-1">
					{certifications.length > 0 ? (
						<>
							{visibleCerts.map((cert, index) => {
								const credentialUrl = cert.url || cert.credential_url
								return (
									<div
										key={`${cert.name || cert.issuer || "cert"}-${index}`}
										className="relative flex gap-4 pb-6 last:pb-0">
										{/* Timeline line */}
										{index < visibleCerts.length - 1 && (
											<div className="absolute left-6 top-14 bottom-0 w-px bg-border" />
										)}
										<div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm`}>
											<Award className={`h-6 w-6 ${iconText}`} aria-hidden="true" />
										</div>
										<div className="min-w-0 flex-1 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border hover:shadow-sm">
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0 flex-1">
													{cert.name && <h3 className="font-semibold text-foreground">{cert.name}</h3>}
													{cert.issuer && <p className="text-sm text-muted-foreground">{cert.issuer}</p>}
												</div>
												{cert.date && (
													<span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
														{cert.date}
													</span>
												)}
											</div>
											{cert.description && (
												<p className="mt-1 text-sm text-muted-foreground">
													<ReadMoreText text={cert.description} maxLength={200} />
												</p>
											)}
											{/* Verification row — only rendered with real evidence (ID or link). No fake verified appearance for self-claimed credentials (report §6.5). */}
											<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
												{cert.credential_id && (
													<p className="text-xs text-muted-foreground">
														Credential ID: <span className="font-mono">{cert.credential_id}</span>
													</p>
												)}
												{credentialUrl && (
													<a
														href={credentialUrl}
														target="_blank"
														rel="noreferrer"
														className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
														<BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
														View credential
													</a>
											)}
											</div>
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
							icon={<Award className="h-5 w-5" />}
							title="Add your licences & certifications"
							description="Add professional credentials with the issuing organization, date, and credential ID to build trust."
							action={canEdit ? (
								<CertificationsEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
									<Button variant="outline" className="gap-2">
										<Plus className="h-4 w-4" /> Add certification
									</Button>
								</CertificationsEditDialog>
							) : undefined}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default CertificationsSection
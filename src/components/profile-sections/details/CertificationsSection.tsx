import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Award, ChevronDown, ChevronUp } from "lucide-react"
import CertificationsEditDialog from "@/components/profile-sections/CertificationsEditDialog"
import { UserProfile } from "@/types"

interface CertificationsSectionProps {
	profile: UserProfile
	handleProfileUpdate: () => void
	maxVisible?: number
	canEdit?: boolean
}

const CertificationsSection = ({
	profile,
	handleProfileUpdate,
	maxVisible,
	canEdit = true,
}: CertificationsSectionProps) => {
	const [isExpanded, setIsExpanded] = useState(false)
	const certifications = profile.certifications || []
	const defaultLimit = 2
	const limit = isExpanded ? certifications.length : defaultLimit
	const visibleCerts = certifications.slice(0, limit)
	const hasMore = certifications.length > defaultLimit

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

	return (
		<div className="relative pl-4 pr-4">
			{/* Left bracket */}
			<div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-light z-10">
				{"{"}
			</div>
			
			{/* Right bracket */}
			<div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-light z-10">
				{"}"}
			</div>

			<Card className="border border-gray-300 rounded-lg shadow-sm">
				<CardContent className="px-4 py-4">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-800">Licence & Certifications</h2>
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
					<div className="space-y-4">
						{certifications.length > 0 ? (
							<>
								{visibleCerts.map((cert: any, index: number) => (
									<div
										key={index}
										className="flex space-x-4">
										<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
											<Award className={`h-6 w-6 ${iconText}`} />
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-gray-900">{cert.name || "[Certification Name]"}</h3>
											<p className="text-gray-600">{cert.issuer || "[Issuing Organization]"}</p>
											<p className="text-sm text-gray-500">{cert.date || "[Date]"}</p>
											{cert.credential_id && (
												<p className="text-xs text-gray-500">
													Credential ID: {cert.credential_id}
												</p>
											)}
										</div>
									</div>
								))}
								{hasMore && (
									<button
										type="button"
										className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
										onClick={() => setIsExpanded(!isExpanded)}
									>
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
							<p className="text-gray-500">
								No certifications added yet. Click edit to add your certifications.
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default CertificationsSection

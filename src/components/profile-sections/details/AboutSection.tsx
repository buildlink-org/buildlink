import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import AboutEditDialog from "@/components/profile-sections/AboutEditDialog"
import { UserProfile } from "@/types"

interface AboutSectionProps {
	profile: UserProfile
	handleProfileUpdate: () => void
	noCard?: boolean
	publicProfile?: boolean
}

const AboutSection = ({ profile, handleProfileUpdate, noCard = false, publicProfile = true }: AboutSectionProps) => {
	const [isAboutExpanded, setIsAboutExpanded] = useState(false)

	const renderAboutContent = () => {
		if (!profile.bio) {
			return <div className="italic text-gray-500">No professional summary available yet. Click edit to add your story and let others know about your journey, expertise, and career aspirations.</div>
		}

		const characterLimit = 220
		const shouldTruncate = profile.bio.length > characterLimit
		const displayText = isAboutExpanded || !shouldTruncate ? profile.bio : profile.bio.substring(0, characterLimit) + "..."

		return (
			<div className="space-y-3">
				<div className="whitespace-pre-wrap break-words leading-relaxed text-gray-700">{displayText}</div>
				{shouldTruncate && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsAboutExpanded(!isAboutExpanded)}
						className="h-auto px-2 py-1 font-medium text-primary hover:text-white">
						{isAboutExpanded ? "Show less" : "Read more"}
					</Button>
				)}
			</div>
		)
	}

	const content = (
		<div className="flex flex-1 flex-col">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-800">About</h2>
				{!publicProfile && (
					<AboutEditDialog
						currentProfile={profile}
						onProfileUpdated={handleProfileUpdate}>
						<Button
							variant="ghost"
							size="sm">
							<Edit className="h-4 w-4" />
						</Button>
					</AboutEditDialog>
				)}
			</div>
			<div className="prose prose-gray max-w-none flex-1">{renderAboutContent()}</div>
		</div>
	)

	if (noCard) {
		return content
	}

	return (
		<Card className="flex h-full flex-col border-0 shadow-sm">
			<CardContent className="flex flex-1 flex-col px-4 py-4 shadow-md">{content}</CardContent>
		</Card>
	)
}

export default AboutSection

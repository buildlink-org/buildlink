import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import LanguagesEditDialog from "@/components/profile-sections/LanguagesEditDialog"
import { Badge } from "@/components/ui/badge"
import { UserProfile } from "@/types"

type Language = {
	name: string
	proficiency?: string
}

interface LanguagesSectionProps {
	profile: UserProfile
	handleProfileUpdate: () => void
}

const normalizeLanguages = (raw: any[] | undefined | null): Language[] => {
	if (!raw) return []

	return raw
		.map((item) => {
			if (typeof item === "string") {
				return { name: item }
			}
			if (typeof item === "object" && item !== null) {
				if (item.name) {
					return { name: String(item.name), proficiency: item.proficiency }
				}
			}
			return null
		})
		.filter((x): x is Language => !!x && !!x.name)
}

const LanguagesSection = ({ profile, handleProfileUpdate }: LanguagesSectionProps) => {
	const languages = normalizeLanguages((profile as any).languages)

	const userType = profile.user_type?.toLowerCase() || "student"

	let badgeClasses = "bg-yellow-100 text-yellow-900 border border-yellow-200"
	if (userType === "professional") {
		badgeClasses = "bg-[#FFCBA4] text-orange-900 border border-orange-200"
	} else if (userType === "company") {
		badgeClasses = "bg-green-100 text-green-900 border border-green-200"
	}

	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="rounded-md px-4 py-4 shadow-md">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-gray-800">Languages</h2>
					<LanguagesEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
						<Button variant="ghost" size="sm" className="px-2" type="button" aria-label="Edit languages">
							<Edit className="h-4 w-4" />
						</Button>
					</LanguagesEditDialog>
				</div>

				<div className="space-y-3">
					{languages.length === 0 ? (
						<p className="text-gray-500 italic text-sm">
							No languages added yet. Click edit to showcase the languages you speak.
						</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{languages.map((lang, idx) => {
								const label = lang.proficiency
									? `${lang.name} (${lang.proficiency})`
									: lang.name

								return (
									<Badge
										key={`${lang.name}-${idx}`}
										variant="secondary"
										className={`${badgeClasses} rounded-full px-4 py-1 text-sm font-medium capitalize transition-colors hover:brightness-95`}
									>
										{label}
									</Badge>
								)
							})}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	)
}

export default LanguagesSection



import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import LanguagesEditDialog from "@/components/profile-sections/LanguagesEditDialog"
import { Badge } from "@/components/ui/badge"
import { UserProfile } from "@/types"

type Language = {
	name: string
	proficiency: string
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

	let badgeClasses = "bg-student-100 text-student-900 border border-student-border dark:bg-student-900/40 dark:text-student-50 dark:border-student-700/50"
	if (userType === "professional") {
		badgeClasses = "bg-professional-100 text-professional-900 border border-professional-border dark:bg-professional-900/40 dark:text-professional-50 dark:border-professional-700/50"
	} else if (userType === "company") {
		badgeClasses = "bg-company-100 text-company-900 border border-company-border dark:bg-company-900/40 dark:text-company-50 dark:border-company-700/50"
	}

	return (
		<Card className="border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
			<CardContent className="px-4 py-4">
				<div className="mb-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">Languages</h2>
						{languages.length > 0 && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{languages.length}</span>
						)}
					</div>
					<LanguagesEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
						<Button variant="ghost" size="sm" className="px-2" type="button" aria-label="Edit languages">
							<Edit className="h-4 w-4" />
						</Button>
					</LanguagesEditDialog>
				</div>

				<div className="space-y-3">
					{languages.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-6 text-center">
							<div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
								<Edit className="h-5 w-5 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground">
								No languages added yet. Click edit to showcase the languages you speak.
							</p>
						</div>
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
										className={`${badgeClasses} rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all hover:scale-105 hover:shadow-sm cursor-default`}
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



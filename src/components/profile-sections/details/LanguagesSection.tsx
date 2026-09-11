import { Card, CardContent } from "@/components/ui/card"
import { Languages } from "lucide-react"
import LanguagesEditDialog from "@/components/profile-sections/LanguagesEditDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserProfile } from "@/types"
import EmptyState from "@/components/profile/EmptyState"
import EditIconButton from "@/components/profile/EditIconButton"

type Language = {
	name: string
	proficiency?: string
}

interface LanguagesSectionProps {
	profile: UserProfile
	handleProfileUpdate: () => void
	canEdit?: boolean
}

const normalizeLanguages = (raw: unknown[] | undefined | null): Language[] => {
	if (!raw) return []

	return raw
		.map((item): Language | null => {
			if (typeof item === "string") {
				return { name: item }
			}
			if (typeof item === "object" && item !== null && (item as Record<string, unknown>).name) {
				const rec = item as Record<string, unknown>
				return { name: String(rec.name), proficiency: rec.proficiency ? String(rec.proficiency) : undefined }
			}
			return null
		})
		.filter((x): x is Language => !!x && !!x.name)
}

/**
 * Compact supporting module (report §6.6): language chips with explicit
 * text proficiency labels — never color-only signaling (report §11).
 */
const LanguagesSection = ({ profile, handleProfileUpdate, canEdit = false }: LanguagesSectionProps) => {
	const languages = normalizeLanguages((profile as { languages?: unknown[] }).languages)

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
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-base font-semibold text-foreground">Languages</h2>
						{languages.length > 0 && (
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
								{languages.length} {languages.length === 1 ? "language" : "languages"}
							</span>
						)}
					</div>
					{canEdit && (
						<LanguagesEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
							<EditIconButton label="Edit languages" />
						</LanguagesEditDialog>
					)}
				</div>

				{languages.length === 0 ? (
					<EmptyState
						icon={<Languages className="h-5 w-5" />}
						title="Add your languages"
						description="Add the languages you speak and your proficiency level."
						action={canEdit ? (
							<LanguagesEditDialog currentProfile={profile} onProfileUpdated={handleProfileUpdate}>
								{/* Real button — a clickable Badge is not a proper control (report §8/§9) */}
								<Button variant="outline" className="gap-2">
									<Languages className="h-4 w-4" /> Add languages
								</Button>
							</LanguagesEditDialog>
						) : undefined}
					/>
				) : (
					<div className="flex flex-wrap gap-2">
						{languages.map((lang, idx) => {
							// Proficiency always as text (e.g. "English — Fluent")
							const label = lang.proficiency ? `${lang.name} — ${lang.proficiency}` : lang.name
							return (
								<Badge
									key={`${lang.name}-${idx}`}
									variant="secondary"
									className={`${badgeClasses} rounded-full px-3 py-1 text-xs sm:text-sm font-medium cursor-default`}>
									{label}
								</Badge>
							)
						})}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default LanguagesSection
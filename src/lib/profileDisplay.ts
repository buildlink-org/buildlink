import { UserProfile } from "@/types"

const joinDistinctDetails = (values: (string | null | undefined)[]): string | null => {
	const details = values
		.map((value) => value?.trim())
		.filter((value): value is string => Boolean(value))
		.filter((value, index, all) => all.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)

	return details.join(" - ") || null
}

export const getProfileSubtitle = (profile: UserProfile): string | null => {
	if (profile.user_type === "student") {
		return joinDistinctDetails([profile.education_level, profile.organization])
	}

	if (profile.user_type === "professional") {
		return joinDistinctDetails([profile.title || profile.profession, profile.organization])
	}

	const companyProfessions = Array.isArray(profile.profession) ? profile.profession : [profile.profession]
	const professions = companyProfessions
		.map((value) => value.trim())
		.filter((value, index, all) => Boolean(value) && all.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)
		.join(", ")
	return joinDistinctDetails([professions, profile.locations?.[0]])
}

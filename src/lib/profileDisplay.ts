import { UserProfile } from "@/types"
import { companyProfessionOptions, studentProfessionOptions } from "@/lib/signUpData"

const joinDistinctDetails = (values: (string | null | undefined)[]): string | null => {
	const details = values
		.map((value) => value?.trim())
		.filter((value): value is string => Boolean(value))
		.filter((value, index, all) => all.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)

	return details.join(" - ") || null
}

const getProfessionLabel = (profile: UserProfile): string | null => {
	const professions = Array.isArray(profile.profession) ? profile.profession : [profile.profession]
	const options = profile.user_type === "company" ? companyProfessionOptions : studentProfessionOptions
	return professions
		.map((profession) => profession?.trim())
		.filter((profession): profession is string => Boolean(profession))
		.map((profession) => options.find((option) => option.value === profession)?.label || profession)
		.filter((profession, index, all) => all.findIndex((item) => item.toLowerCase() === profession.toLowerCase()) === index)
		.join(", ") || null
}

export const getProfileSubtitle = (profile: UserProfile): string | null => {
	if (profile.user_type === "student") {
		const educationLevel = profile.education_level?.trim()
		const institution = profile.organization?.trim()
		return joinDistinctDetails([
			getProfessionLabel(profile),
			educationLevel || "Education level not added",
			institution || "Institution not added",
		])
	}

	if (profile.user_type === "professional") {
		return joinDistinctDetails([
			profile.title || getProfessionLabel(profile),
			profile.education_level,
			profile.organization,
		])
	}

	return joinDistinctDetails([getProfessionLabel(profile), profile.locations?.[0]])
}

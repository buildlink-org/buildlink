export type BaseProfile = {
	id: string
	title: string
	full_name: string | null
	avatar: string | null
	banner: string | null
	bio: string | null
	account_tier: "basic" | "premium"
	profile_visibility: "public" | "private" | "connections"
	verification_level: "unverified" | "verified"
	verification_badges: string[]
	social_links: Record<string, string>
	created_at: string
	education?: Education[]
	updated_at: string
	profession?: string
	organization?: string 
	education_level?: string 
	skills?: string[]
	languages?: string[]
	experiences?: string[] 
	certifications?: any[] 
	profile_completion_score?: number
}

export type StudentProfile = BaseProfile & {
	user_type: "student"
	education_level: string | null
	activity?: any[] // posts, likes, etc.
	profession: string[]
	organization: string
	portfolio?: {
		title?: string
		url?: string
		description?: string
	}[]
	training?: {
		name?: string
		institution?: string
		year?: string
	}[]
	experience?: {
		title?: string
		company?: string
		startDate?: string
		endDate?: string
		description?: string
	}[]
	connections?: string[] // list of profile IDs or short previews
}

export type ProfessionalProfile = BaseProfile & {
	user_type: "professional"
	title: string | null
	profession: string | null
	organization: string | null
	skills: string[]
	certifications?: {
		name?: string
		issuer?: string
		date?: string
	}[]
	experience?: {
		title?: string
		company?: string
		startDate?: string
		endDate?: string
		description?: string
	}[]
	education?: Education[]
	portfolio?: {
		title?: string
		url?: string
		description?: string
	}[]
	connections?: string[]
	activity?: any[]
}
export type CompanyProfile = BaseProfile & {
	user_type: "company"
	organization: string
	about?: string
	activity?: any[]
	profession: string[]
	jobs?: {
		title: string
		description?: string
		location?: string
		type?: "full-time" | "part-time" | "contract" | "internship"
		posted_at?: string
	}[]
	people?: {
		id: string
		name: string
		role?: string
		avatar?: string
	}[]
	products?: {
		name: string
		description?: string
		link?: string
	}[]
	services?: {
		name: string
		description?: string
	}[]
	events?: {
		name: string
		date?: string
		location?: string
		description?: string
	}[]
	culture?: {
		title?: string
		description?: string
		media?: string[]
	}[]
}

export type Education = {
	degree?: string
	institution?: string
	startDate?: string
	endDate?: string
	description?: string
	year?: number
}

export type UserProfile = StudentProfile | ProfessionalProfile | CompanyProfile

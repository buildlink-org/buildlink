export type PortfolioItem = {
	id: string
	name: string
	url: string
	type: string
	description?: string
	thumbnailUrl?: string
}

type People = {
	id: string
	name: string
	role?: string
	avatar?: string
}

export type Products = {
	name: string
	description?: string
	link?: string
	title?: string
	url?: string
}

type Experiences = {
	title?: string
	company?: string
	startDate?: string
	endDate?: string
	description?: string
}

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
	experience?: string[]
	Certification?: any[]
	certifications?: string[]
	profile_completion_score?: number
}

export type StudentProfile = BaseProfile & {
	user_type: "student"
	featured: Products[]
	people: People[]
	products: Products[]
	education_level: string | null
	activity?: any[] // posts, likes, etc.
	profession: string[]
	organization: string
	portfolio?: PortfolioItem[]
	training?: {
		name?: string
		institution?: string
		year?: string
	}[]
	experiences?: Experiences[]
	connections?: string[]
	following?: { name?: string; role?: string; avatar?: string }[]
	interests?: string[]
}

export type ProfessionalProfile = BaseProfile & {
	user_type: "professional"
	title: string | null
	featured: Products[]
	interests?: string[]
	profession: string | null
	organization: string | null
	skills: string[]
	certifications?: {
		name?: string
		issuer?: string
		date?: string
	}[]
	people?: People[]
	products: Products[]
	experiences?: Experiences[]
	education?: Education[]
	portfolio?: PortfolioItem[]
	connections?: string[]
	activity?: any[]
	following?: { name?: string; role?: string; avatar?: string }[]
}

export type CompanyProfile = BaseProfile & {
	user_type: "company"
	following?: { name?: string; role?: string; avatar?: string }[]
	interests?: string[]
	experiences?: Experiences[]
	featured: Products[]
	organization: string
	connections?: string[]
	about?: string
	activity?: any[]
	profession: string[]
	portfolio: PortfolioItem[]
	jobs?: {
		title: string
		description?: string
		location?: string
		type?: "full-time" | "part-time" | "contract" | "internship"
		posted_at?: string
	}[]
	experience?: string[]
	people?: People[]
	products: Products[]
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

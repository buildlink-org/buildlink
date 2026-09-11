export type PortfolioItem = {
	id: string
	name: string
	url: string
	type: string
	description?: string
	thumbnailUrl?: string
	/** Project role / contribution, e.g. "Project Coordinator" */
	role?: string
	/** Project location, e.g. "Nairobi" */
	location?: string
	/** Discipline / project type, e.g. "Construction Management" */
	projectType?: string
	/** Status, e.g. "Completed", "In Progress" */
	status?: string
	/** Year(s), e.g. "2025" */
	year?: string
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

export type Experiences = {
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy shape, kept as-is
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy shape, kept as-is
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy shape, kept as-is
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy shape, kept as-is
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
	/** Field of study / major, e.g. "Information Technology" */
	fieldOfStudy?: string
	description?: string
	/** Legacy single year or period string, e.g. 2020 or "2015-2019" (kept for back-compat) */
	year?: number | string
}

export type UserProfile = StudentProfile | ProfessionalProfile | CompanyProfile

// types.ts
export type Notification = {
  id: string
  content: string
  type: string
  read: boolean
  created_at: string
  from_user?: {
    full_name?: string
    avatar?: string
  }
}
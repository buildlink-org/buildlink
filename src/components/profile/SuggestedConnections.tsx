import React, { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { connectionsService } from "@/services/connectionsService"
import { Button } from "@/components/ui/button"
import SectionHeader from "@/components/profile/SectionHeader"
import AccountTypeBadge from "@/components/AccountTypeBadge"
import { Link } from "react-router-dom"

interface ProfileRow {
	id: string
	full_name: string | null
	avatar: string | null
	title: string | null
	profession: string | string[] | null
	user_type: string | null
	skills: unknown
	certifications: unknown
	verification_badges: unknown
	portfolio: unknown
	organization: string | null
	education_level: string | null
}

interface RecentPost {
	author_id: string
	content: string | null
	created_at: string | null
}

interface SuggestionRow {
	profile: ProfileRow
	subtitle: string
	score: number
}

interface SuggestedConnectionsProps {
	profileId: string
	/** Current member's professions — used to prioritize trade compatibility */
	myProfessions?: string[]
	showEmpty?: boolean
}

const flattenStrings = (value: unknown): string[] => {
	if (typeof value === "string") return [value]
	if (Array.isArray(value)) return value.flatMap(flattenStrings)
	if (value && typeof value === "object") return Object.values(value).flatMap(flattenStrings)
	return []
}

const normalize = (value: string) => value.trim().toLowerCase()

const sharedValues = (left: string[], right: string[]) => {
	const normalizedRight = right.map(normalize).filter(Boolean)
	return [...new Set(left.map(normalize).filter(Boolean))].filter((item) =>
		normalizedRight.some((other) => item === other || (item.length > 3 && other.includes(item)) || (other.length > 3 && item.includes(other))),
	)
}

const getProfileTradeTerms = (profile: ProfileRow) => [
	...(Array.isArray(profile.profession) ? profile.profession : [profile.profession || ""]),
	profile.title || "",
	...flattenStrings(profile.skills),
].filter(Boolean)

const getPortfolioValues = (portfolio: unknown, keys: string[]) => {
	if (!Array.isArray(portfolio)) return []
	return portfolio.flatMap((item) => {
		if (!item || typeof item !== "object") return []
		return keys.flatMap((key) => {
			const value = (item as Record<string, unknown>)[key]
			return typeof value === "string" && value.trim() ? [value] : []
		})
	})
}

const getIndustryBoards = (profile: ProfileRow) => {
	const credentials = [...flattenStrings(profile.certifications), ...flattenStrings(profile.verification_badges)].join(" ").toLowerCase()
	return ["EBK", "BORAQS", "NCA"].filter((board) => credentials.includes(board.toLowerCase()))
}

const SuggestedConnections: React.FC<SuggestedConnectionsProps> = ({ profileId, myProfessions = [], showEmpty = false }) => {
	const [suggestions, setSuggestions] = useState<SuggestionRow[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const scrollRef = useRef<HTMLDivElement>(null)

	const myProfessionsKey = myProfessions.join(",")

	const load = useCallback(async () => {
		if (!profileId) return
		setLoading(true)
		setError(null)
		try {
			// Exclude self + everyone already connected (either direction)
			const { data: conns, error: connectionsError } = await connectionsService.getConnections(profileId)
			if (connectionsError) throw connectionsError
			const excluded = new Set<string>([profileId])
			;(conns || []).forEach((c) => {
				if (c.user_id === profileId && c.connected_user_id) excluded.add(c.connected_user_id)
				else if (c.user_id) excluded.add(c.user_id)
			})

			const activeSince = new Date()
			activeSince.setDate(activeSince.getDate() - 30)
			const [viewerResult, activityResult] = await Promise.all([
				supabase
					.from("profiles")
					.select("id, full_name, avatar, title, profession, user_type, skills, certifications, verification_badges, portfolio, organization, education_level")
					.eq("id", profileId)
					.maybeSingle(),
				supabase
					.from("posts")
					.select("author_id, content, location, created_at")
					.eq("visibility", "public")
					.gte("created_at", activeSince.toISOString())
					.order("created_at", { ascending: false })
					.limit(100),
			])

			if (viewerResult.error) throw viewerResult.error
			if (activityResult.error) throw activityResult.error

			const recentPosts = ((activityResult.data || []) as RecentPost[])
				.filter((post) => !excluded.has(post.author_id))

			const { data, error: queryError } = await supabase
				.from("profiles")
				.select("id, full_name, avatar, title, profession, user_type, skills, certifications, verification_badges, portfolio, organization, education_level")
				.in("user_type", ["student", "graduate", "professional"])
				.or("profile_visibility.eq.public,profile_visibility.is.null")
				.not("full_name", "is", null)
				.neq("id", profileId)
				.neq("full_name", "")
				.neq("full_name", "New User")
				.limit(100)

			if (queryError) throw queryError

			const viewer = viewerResult.data as ProfileRow | null
			const viewerTrades = [...myProfessions, ...(viewer ? getProfileTradeTerms(viewer) : [])]
			const viewerBoards = viewer ? getIndustryBoards(viewer) : []
			const viewerProjectTypes = viewer ? getPortfolioValues(viewer.portfolio, ["projectType"]) : []
			const viewerLocations = viewer ? getPortfolioValues(viewer.portfolio, ["location"]) : []
			const viewerInstitutions = viewer ? [viewer.organization, viewer.education_level].filter((value): value is string => Boolean(value)) : []
			const latestPostByAuthor = new Map<string, RecentPost>()
			for (const post of recentPosts) {
				if (!latestPostByAuthor.has(post.author_id)) latestPostByAuthor.set(post.author_id, post)
			}

			const rankedSuggestions = ((data || []) as ProfileRow[]).flatMap((profile) => {
				const recentPost = latestPostByAuthor.get(profile.id)
				const tradeOverlap = sharedValues(viewerTrades, getProfileTradeTerms(profile))
				const boardOverlap = sharedValues(viewerBoards, getIndustryBoards(profile))
				const projectOverlap = sharedValues(
					viewerProjectTypes,
					getPortfolioValues(profile.portfolio, ["projectType"]),
				)
				const locationOverlap = sharedValues(
					viewerLocations,
					getPortfolioValues(profile.portfolio, ["location"]),
				)
				const institutionOverlap = sharedValues(
					viewerInstitutions,
					[profile.organization, profile.education_level].filter((value): value is string => Boolean(value)),
				)
				const overlaps = [
					...institutionOverlap.map((institution) => `shared organization or institution: ${institution}`),
					...boardOverlap.map((board) => `shared ${board} board`),
					...projectOverlap.map((project) => `shared ${project} project focus`),
					...locationOverlap.map((location) => `projects in ${location}`),
					...tradeOverlap.map((trade) => `trade overlap: ${trade}`),
				]
				if (overlaps.length === 0) return []
				const score =
					boardOverlap.length * 5 +
					projectOverlap.length * 4 +
					locationOverlap.length * 3 +
					institutionOverlap.length * 3 +
					tradeOverlap.length * 2 +
					(recentPost && /tender|bid|procurement|site progress|technical|structural|engineering|boq/i.test(recentPost.content || "") ? 2 : 0)
				const profession = Array.isArray(profile.profession) ? profile.profession.join(", ") : profile.profession
				return [{
					profile,
					subtitle: profile.title || profession || profile.user_type || "Construction professional",
					score,
				}]
			})

			setSuggestions(rankedSuggestions.sort((a, b) => b.score - a.score).slice(0, 4))
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not load suggestions")
		} finally {
			setLoading(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- key covers array contents
	}, [profileId, myProfessionsKey])

	useEffect(() => {
		load()
	}, [load])

	if (loading) {
		return (
			<Card>
				<CardContent className="py-5">
					<SectionHeader title="Recommendations" />
					<div className="space-y-3">
						{[0, 1, 2].map((i) => (
							<div key={i} className="flex items-center gap-3">
								<div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
								<div className="min-w-0 flex-1 space-y-1.5">
									<div className="h-3 w-24 animate-pulse rounded bg-muted" />
									<div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
								</div>
								<div className="h-7 w-20 animate-pulse rounded-md bg-muted" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card>
				<CardContent className="py-5">
					<SectionHeader title="Recommendations" />
					<div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
						<AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
						<span className="min-w-0 flex-1">{error}</span>
					</div>
					<Button variant="outline" size="sm" className="mt-2 w-full" onClick={load}>
						<Loader2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
						Retry
					</Button>
				</CardContent>
			</Card>
		)
	}

	// No suggestions — hide the module entirely (report: no decorative empty modules)
	if (suggestions.length === 0) {
		return showEmpty ? (
			<Card>
				<CardContent className="py-5">
					<SectionHeader title="Recommendations" description="Profiles connected by skills, profession, or organization" />
					<p className="mt-3 text-sm text-muted-foreground">No related profiles to recommend yet.</p>
				</CardContent>
			</Card>
		) : null
	}

	return (
		<Card>
			<CardContent className="py-5">
				<div className="mb-3 flex items-center justify-between">
					<SectionHeader title="Recommendations" description="Profiles connected by skills, profession, or organization" />
					<Button variant="ghost" size="sm" className="shrink-0" onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}>
						More <ChevronRight className="ml-1 h-4 w-4" />
					</Button>
				</div>
				<div ref={scrollRef} className="flex snap-x gap-3 overflow-x-auto pb-2">
					{suggestions.map((s) => {
						const profile = s.profile
						return (
						<div key={profile.id} className="flex min-w-[220px] max-w-[260px] snap-start items-start gap-3 rounded-lg border border-border bg-card p-3">
							{profile.avatar ? (
								<img
									src={profile.avatar}
									alt={profile.full_name || "Member"}
									loading="lazy"
									className="h-11 w-11 shrink-0 rounded-full object-cover"
								/>
							) : (
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
									{(profile.full_name || "?").charAt(0).toUpperCase()}
								</div>
							)}
							<div className="min-w-0 flex-1">
								<Link to={`/profile/${profile.id}`} className="block truncate text-sm font-medium text-foreground hover:text-primary">
									{profile.full_name}
								</Link>
								<AccountTypeBadge userType={profile.user_type || "student"} className="mt-1 text-[10px]" />
								<p className="truncate text-xs text-muted-foreground">{s.subtitle}</p>
							</div>
						</div>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}

export default SuggestedConnections
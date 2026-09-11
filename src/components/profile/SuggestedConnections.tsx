import React, { useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2, UserPlus } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { connectionsService } from "@/services/connectionsService"
import { Button } from "@/components/ui/button"
import SectionHeader from "@/components/profile/SectionHeader"
import ConnectButton from "@/components/ConnectButton"

interface SuggestionRow {
	id: string
	full_name: string | null
	avatar: string | null
	title: string | null
	profession: string | string[] | null
	user_type: string | null
}

interface SuggestedConnectionsProps {
	profileId: string
	/** Current member's professions — shared-profession suggestions rank first */
	myProfessions?: string[]
}

/**
 * "People you may know" rail module (report §4.1/§15).
 * Suggests public profiles not already connected to the member,
 * preferring shared professions. Hides itself when there are no
 * suggestions — no decorative empty modules.
 */
const SuggestedConnections: React.FC<SuggestedConnectionsProps> = ({ profileId, myProfessions = [] }) => {
	const [suggestions, setSuggestions] = useState<SuggestionRow[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const myProfessionsKey = myProfessions.join(",")

	const load = useCallback(async () => {
		if (!profileId) return
		setLoading(true)
		setError(null)
		try {
			// Exclude self + everyone already connected (either direction)
			const { data: conns } = await connectionsService.getConnections(profileId)
			const excluded = new Set<string>([profileId])
			;(conns || []).forEach((c) => {
				if (c.user_id === profileId && c.connected_user_id) excluded.add(c.connected_user_id)
				else if (c.user_id) excluded.add(c.user_id)
			})

			const { data, error: queryError } = await supabase
				.from("profiles")
				.select("id, full_name, avatar, title, profession, user_type")
				.not("id", "in", `(${Array.from(excluded).join(",")})`)
				.or("profile_visibility.eq.public,profile_visibility.is.null")
				.limit(8)

			if (queryError) throw queryError

			const rows = (data || []) as SuggestionRow[]

			// Prefer shared professions, then fill with others (max 4)
			const mine = myProfessions.map((p) => p.toLowerCase().trim()).filter(Boolean)
			const matchScore = (row: SuggestionRow): number => {
				if (mine.length === 0) return 0
				const theirs = (Array.isArray(row.profession) ? row.profession : [row.profession])
					.filter(Boolean)
					.map((p) => String(p).toLowerCase())
				const title = (row.title || "").toLowerCase()
				return mine.reduce((acc, m) => acc + (theirs.some((t) => t.includes(m) || m.includes(t)) || title.includes(m) ? 1 : 0), 0)
			}

			setSuggestions([...rows].sort((a, b) => matchScore(b) - matchScore(a)).slice(0, 4))
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
					<SectionHeader title="People you may know" />
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
					<SectionHeader title="People you may know" />
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
	if (suggestions.length === 0) return null

	return (
		<Card>
			<CardContent className="py-5">
				<SectionHeader title="People you may know" description="Grow your built-environment network" />
				<div className="space-y-3">
					{suggestions.map((s) => {
						const subtitle = s.title || (Array.isArray(s.profession) ? s.profession.join(", ") : s.profession) || s.user_type
						return (
							<div key={s.id} className="flex items-center gap-3">
								{s.avatar ? (
									<img
										src={s.avatar}
										alt={s.full_name || "Member"}
										loading="lazy"
										className="h-10 w-10 shrink-0 rounded-full object-cover"
									/>
								) : (
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
										{(s.full_name || "?").charAt(0).toUpperCase()}
									</div>
								)}
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-foreground">{s.full_name || "BuildLink member"}</p>
									{subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
								</div>
								<div className="shrink-0 [&_button]:h-8 [&_button]:px-3 [&_button]:text-xs">
									<ConnectButton targetUserId={s.id} />
								</div>
							</div>
						)
					})}
				</div>
				<div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-muted-foreground">
					<UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
					Suggestions are based on public profiles you're not connected to yet.
				</div>
			</CardContent>
		</Card>
	)
}

export default SuggestedConnections
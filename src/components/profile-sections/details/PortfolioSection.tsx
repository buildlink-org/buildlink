import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import PortfolioGallery from "./PortfolioGallery"
import PortfolioEditorDialog from "./PortfolioEditorDialog"
import { supabase } from "@/integrations/supabase/client"
import { portfolioService } from "@/services/portfolioService"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, FolderOpen, Edit, ArrowLeftRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PortfolioItem, UserProfile } from "@/types"
import EmptyState from "@/components/profile/EmptyState"
import FeaturedProjectCard from "./FeaturedProjectCard"

interface PortfolioSectionProps {
	profile: UserProfile
	handleProfileUpdate?: () => void
	canEdit?: boolean
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ profile, handleProfileUpdate, canEdit: canEditProp }) => {
	const [editorOpen, setEditorOpen] = useState(false)
	const [galleryOpen, setGalleryOpen] = useState(false)
	const [updating, setUpdating] = useState(false)
	const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>([])
	const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
	const [arrangeMode, setArrangeMode] = useState(false)
	const { toast } = useToast()

	// Thumbnail swap state: maps item id
	const [swappingId, setSwappingId] = useState<string | null>(null)
	const thumbInputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		setPortfolioList(Array.isArray(profile.portfolio) ? profile.portfolio : [])
	}, [profile.portfolio])

	const canEdit = canEditProp !== undefined ? canEditProp : false

	// Fix #2 — persistence now surfaces Supabase errors and reverts optimistic UI on failure
	const persistPortfolio = async (updated: PortfolioItem[]): Promise<boolean> => {
		setUpdating(true)
		const previous = portfolioList
		setPortfolioList(updated)
		const { error } = await portfolioService.save(profile.id, updated)
		setUpdating(false)
		if (error) {
			setPortfolioList(previous)
			toast({
				title: "Save failed",
				description: "We couldn't save your portfolio changes. Please try again.",
				variant: "destructive",
			})
			return false
		}
		handleProfileUpdate?.()
		return true
	}

	const handlePortfolioAdd = async (item: PortfolioItem) => {
		// Check portfolio limit (max 3 items)
		if (portfolioList.length >= 3) {
			toast({
				title: "Portfolio Limit Reached",
				description: "You can only upload up to 3 portfolio items.",
				variant: "destructive",
			})
			return
		}

		const saved = await persistPortfolio([...portfolioList, item])
		if (!saved) return
		toast({
			title: "Portfolio updated",
			description: "Your new project was added.",
			variant: "default",
		})
	}

	// Remove (with UI feedback)
	const handleRemove = async (id: string) => {
		const saved = await persistPortfolio(portfolioList.filter((item) => item.id !== id))
		if (!saved) return
		toast({
			title: "Removed",
			description: "The project has been removed.",
			variant: "default",
		})
	}

	// ── Thumbnail swap ─────────────────────────────────────────────────────────
	const startThumbSwap = (id: string) => {
		setSwappingId(id)
		thumbInputRef.current?.click()
	}

	const handleThumbFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file || !swappingId) return

		setUpdating(true)
		const ext = file.name.split(".").pop()
		const filename = `${profile.id}/thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
		const { data, error } = await supabase.storage.from("portfolio").upload(filename, file, { upsert: false })
		if (error || !data) {
			setUpdating(false)
			setSwappingId(null)
			toast({ title: "Thumbnail upload failed", variant: "destructive" })
			return
		}
		const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(filename)
		const updated = portfolioList.map((it) =>
			it.id === swappingId ? { ...it, thumbnailUrl: pub.publicUrl } : it
		)
		setSwappingId(null)
		// Reset file input so the same file can be re-selected later
		if (thumbInputRef.current) thumbInputRef.current.value = ""
		const saved = await persistPortfolio(updated)
		if (!saved) return
		toast({ title: "Thumbnail updated", variant: "default" })
	}

	// ── Drag-to-reorder: handled inside PortfolioGallery; cards here use
	// keyboard-accessible move buttons (handleMoveItem) in arrange mode. ───────
	// ── Keyboard-accessible reorder (arrange mode) ──────────────────────
	const handleMoveItem = async (index: number, direction: -1 | 1) => {
		const target = index + direction
		if (target < 0 || target >= portfolioList.length) return
		const reordered = [...portfolioList]
		const [moved] = reordered.splice(index, 1)
		reordered.splice(target, 0, moved)
		const saved = await persistPortfolio(reordered)
		if (!saved) return
		toast({ title: "Order saved", variant: "default" })
	}
	if (!portfolioList || (!canEdit && portfolioList.length === 0 && profile.user_type !== "professional" && profile.user_type !== "student")) return null

	return (
		<Card className="border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
			<CardContent className="px-2 py-6">
				<div className="mb-4 flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">Portfolio</h2>
						<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
							{portfolioList.length}/3 items
						</span>
					</div>
					{canEdit && (
							<div className="flex items-center gap-2">
								{/* Header add action is hidden while empty — the instructional
									empty-state CTA owns that flow */}
								{portfolioList.length > 0 && (
									<Button
									variant="outline"
									size="sm"
									className="gap-2 rounded-md border-border text-foreground hover:bg-accent hover:text-accent-foreground dark:border-border dark:text-foreground dark:hover:bg-accent px-4 py-1 h-auto text-xs"
									onClick={() => setEditorOpen(true)}
									disabled={updating || portfolioList.length >= 3}
									aria-label="Add project">
									<Plus className="h-4 w-4" />
									+ Add Project
								</Button>
							)}
							{portfolioList.length > 1 && (
								<Button
									variant={arrangeMode ? "default" : "ghost"}
									size="sm"
									className="gap-2"
									onClick={() => setArrangeMode((v) => !v)}
									disabled={updating}
									aria-label={arrangeMode ? "Exit arrange mode" : "Rearrange projects"}
									title={arrangeMode ? "Exit arrange mode" : "Rearrange projects"}>
									<ArrowLeftRight className="h-4 w-4" />
									<span className="hidden sm:inline">{arrangeMode ? "Done" : "Arrange"}</span>
								</Button>
							)}
							{/* Manage projects — opens the gallery (rename, reorder, thumbnails, remove) */}
							<Button
								variant="ghost"
								size="sm"
								className="gap-2"
								onClick={() => setGalleryOpen(true)}
								disabled={updating || portfolioList.length === 0}
								aria-label="Manage projects"
								title="Manage projects">
								<Edit className="h-4 w-4" />
								<span className="hidden sm:inline">Manage</span>
							</Button>
						</div>
					)}
				</div>

				{arrangeMode && (
					<p className="mb-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
						Use the arrow buttons on each card to reorder. Click <strong>Done</strong> again to exit.
					</p>
				)}

{portfolioList.length === 0 ? (
<EmptyState
icon={<FolderOpen className="h-5 w-5" />}
title={canEdit ? "Showcase your work" : "No projects yet"}
description={canEdit
? "Add a project with images, your role, location, and the outcome to build professional credibility."
: "This member hasn't added any projects yet."}
action={canEdit ? (
<Button
variant="outline"
onClick={() => setEditorOpen(true)}
disabled={updating}
className="gap-2">
<Plus className="h-4 w-4" /> Add your first project
</Button>
) : undefined}
/>
) : (
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
{portfolioList.map((item, index) => (
<FeaturedProjectCard
key={item.id}
item={item}
arrangeMode={arrangeMode}
updating={updating}
onOpen={() => {
if (arrangeMode) return
if (item.type === "link") window.open(item.url, "_blank", "noopener,noreferrer")
else {
setActiveGalleryIndex(index)
setGalleryOpen(true)
}
}}
onSwapThumbnail={canEdit ? () => startThumbSwap(item.id) : undefined}
onMoveUp={index > 0 ? () => handleMoveItem(index, -1) : undefined}
onMoveDown={index < portfolioList.length - 1 ? () => handleMoveItem(index, 1) : undefined}
/>
))}
</div>
)}
				{/* Hidden file input for thumbnail swap */}
				<input
					type="file"
					accept="image/*"
					ref={thumbInputRef}
					onChange={handleThumbFileChange}
					className="sr-only"
					tabIndex={-1}
				/>

				<PortfolioGallery
					open={galleryOpen}
					setOpen={setGalleryOpen}
					portfolio={portfolioList}
					activeIndex={activeGalleryIndex}
					setActiveIndex={setActiveGalleryIndex}
					canEdit={canEdit}
					onRemove={handleRemove}
					onRename={async (id, name) => {
						const updated = portfolioList.map((it) => (it.id === id ? { ...it, name } : it))
						const saved = await persistPortfolio(updated)
						if (!saved) return
						toast({ title: "Title updated", variant: "default" })
					}}
					onReorder={async (reordered) => {
						const saved = await persistPortfolio(reordered)
						if (!saved) return
						toast({ title: "Order saved", variant: "default" })
					}}
					onSwapThumbnail={async (id, url) => {
						const updated = portfolioList.map((it) => (it.id === id ? { ...it, thumbnailUrl: url } : it))
						const saved = await persistPortfolio(updated)
						if (!saved) return
						toast({ title: "Thumbnail updated", variant: "default" })
					}}
					profileId={profile.id}
					updating={updating}
				/>

				<PortfolioEditorDialog
					open={editorOpen}
					setOpen={setEditorOpen}
					portfolioList={portfolioList}
					profileId={profile.id}
					handleProfileUpdate={handleProfileUpdate}
					onPortfolioAdd={handlePortfolioAdd}
					asIconButton={false}
					disabled={updating}
				/>
			{updating && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 dark:bg-black/60">
					<div className="flex animate-fade-in items-center gap-2 rounded-lg bg-card p-4 text-sm text-foreground shadow-lg border border-border">
						<Loader2 className="h-5 w-5 animate-spin text-primary" />
						Saving changes...
					</div>
				</div>
			)}
			</CardContent>
		</Card>
	)
}

export default PortfolioSection
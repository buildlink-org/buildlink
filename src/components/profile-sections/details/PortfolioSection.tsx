import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import PortfolioGallery from "./PortfolioGallery"
import PortfolioEditorDialog from "./PortfolioEditorDialog"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, FolderOpen, Edit, GripVertical, Check, X, Image as ImageIcon, ArrowLeftRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PortfolioItem, UserProfile } from "@/types"

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

	// Inline edit state: maps item id → draft name
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editDraft, setEditDraft] = useState("")

	// Drag-to-reorder state
	const dragItem = useRef<number | null>(null)
	const dragOverItem = useRef<number | null>(null)

	// Thumbnail swap state: maps item id
	const [swappingId, setSwappingId] = useState<string | null>(null)
	const thumbInputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		setPortfolioList(Array.isArray(profile.portfolio) ? profile.portfolio : [])
	}, [profile.portfolio])

	const canEdit = canEditProp !== undefined ? canEditProp : false

	// Get account-type-specific colors matching ProfileHeader
	const getColorConfig = () => {
		const userType = profile?.user_type?.toLowerCase() || "student"

		if (userType === "student") {
			return {
				bgColor: "bg-student-100 dark:bg-yellow-950",
				borderColor: "border-student-border dark:border-yellow-800",
			}
		} else if (userType === "professional") {
			return {
				bgColor: "bg-professional-100 dark:bg-orange-950",
				borderColor: "border-professional-border dark:border-orange-800",
			}
		} else if (userType === "company") {
			return {
				bgColor: "bg-company-100 dark:bg-green-950",
				borderColor: "border-company-border dark:border-green-800",
			}
		}
		// Default fallback
		return {
			bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900",
			borderColor: "border-blue-200 dark:border-slate-700",
		}
	}

	const colorConfig = getColorConfig()

	const persistPortfolio = async (updated: PortfolioItem[]) => {
		setUpdating(true)
		setPortfolioList(updated)
		await supabase.from("profiles").update({ portfolio: updated }).eq("id", profile.id)
		setUpdating(false)
		handleProfileUpdate()
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

		setUpdating(true)
		const newPortfolio = [...portfolioList, item]
		setPortfolioList(newPortfolio)
		await supabase.from("profiles").update({ portfolio: newPortfolio }).eq("id", profile.id)
		setUpdating(false)
		handleProfileUpdate()
		toast({
			title: "Portfolio updated",
			description: "Your new project was added.",
			variant: "default",
		})
	}

	// Remove (with UI feedback)
	const handleRemove = async (id: string) => {
		setUpdating(true)
		const newPortfolio = portfolioList.filter((item) => item.id !== id)
		setPortfolioList(newPortfolio)
		await supabase.from("profiles").update({ portfolio: newPortfolio }).eq("id", profile.id)
		setUpdating(false)
		handleProfileUpdate()
		toast({
			title: "Removed",
			description: "The project has been removed.",
			variant: "default",
		})
	}

	// ── Inline rename ──────────────────────────────────────────────────────────
	const startEdit = (item: PortfolioItem, e: React.MouseEvent) => {
		e.stopPropagation()
		setEditingId(item.id)
		setEditDraft(item.name)
	}

	const commitEdit = async (e?: React.MouseEvent | React.KeyboardEvent) => {
		e?.stopPropagation()
		if (!editingId) return
		const updated = portfolioList.map((it) =>
			it.id === editingId ? { ...it, name: editDraft.trim() || it.name } : it
		)
		setEditingId(null)
		await persistPortfolio(updated)
		toast({ title: "Title updated", variant: "default" })
	}

	const cancelEdit = (e?: React.MouseEvent) => {
		e?.stopPropagation()
		setEditingId(null)
	}

	// ── Thumbnail swap ─────────────────────────────────────────────────────────
	const startThumbSwap = (id: string, e: React.MouseEvent) => {
		e.stopPropagation()
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
		await persistPortfolio(updated)
		toast({ title: "Thumbnail updated", variant: "default" })
	}

	// ── Drag-to-reorder ────────────────────────────────────────────────────────
	const handleDragStart = (index: number) => {
		dragItem.current = index
	}

	const handleDragEnter = (index: number) => {
		dragOverItem.current = index
	}

	const handleDragEnd = async () => {
		if (dragItem.current === null || dragOverItem.current === null) return
		if (dragItem.current === dragOverItem.current) {
			dragItem.current = null
			dragOverItem.current = null
			return
		}
		const reordered = [...portfolioList]
		const [moved] = reordered.splice(dragItem.current, 1)
		reordered.splice(dragOverItem.current, 0, moved)
		dragItem.current = null
		dragOverItem.current = null
		await persistPortfolio(reordered)
		toast({ title: "Order saved", variant: "default" })
	}

	if (!portfolioList || (!canEdit && portfolioList.length === 0)) return null

	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="px-2 py-6">
				<div className="mb-6 flex flex-wrap items-center justify-between gap-y-2">
					<div className="flex items-center space-x-2">
						<h3 className="text-lg font-semibold text-foreground">Portfolio</h3>
						<span className="text-sm text-muted-foreground">({portfolioList.length}/3 items uploaded)</span>
					</div>
					{canEdit && (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								className="gap-2"
								onClick={() => setEditorOpen(true)}
								disabled={updating}>
								<Plus className="h-4 w-4" />
								Add Project
							</Button>
							{portfolioList.length > 1 && (
								<Button
									variant={arrangeMode ? "default" : "ghost"}
									size="sm"
									className="gap-2"
									onClick={() => setArrangeMode((v) => !v)}
									disabled={updating}
									title={arrangeMode ? "Exit arrange mode" : "Rearrange projects"}>
									<ArrowLeftRight className="h-4 w-4" />
									<span className="hidden sm:inline">{arrangeMode ? "Done" : "Arrange"}</span>
								</Button>
							)}
							<Button
								variant="ghost"
								size="sm"
								className="gap-2"
								onClick={() => setGalleryOpen(true)}
								disabled={updating || portfolioList.length === 0}>
								<Edit className="h-4 w-4" />
							</Button>
						</div>
					)}
				</div>

				{arrangeMode && (
					<p className="mb-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
						Drag cards to reorder. Click <strong>Arrange</strong> again to exit.
					</p>
				)}

				{portfolioList.length === 0 ? (
					<div className="py-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
							<FolderOpen className="h-8 w-8 text-muted-foreground" />
						</div>
						<h4 className="mb-2 text-lg font-medium text-foreground">No projects yet</h4>
						<p className="mb-6 text-muted-foreground">Showcase your work and achievements</p>
						<Button
							variant="outline"
							onClick={() => setEditorOpen(true)}
							disabled={updating}>
							<Plus className="mr-2 h-4 w-4" />
							Add your first project
						</Button>
					</div>
				) : (
					<div className="space-y-6">
						{/* Portfolio Grid styled as folder cards */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{portfolioList.map((item, index) => {
								// Determine card positioning: middle card (index 1) gets mt-6, others get mb-6
								const isMiddleCard = index === 1 && portfolioList.length === 3
								const cardClasses = isMiddleCard ? "mt-6" : "mb-6"
								const isEditing = editingId === item.id

								return (
									<div
										key={item.id}
										className={`cursor-pointer group ${cardClasses} ${arrangeMode ? "cursor-grab active:cursor-grabbing" : ""}`}
										draggable={arrangeMode}
										onDragStart={() => arrangeMode && handleDragStart(index)}
										onDragEnter={() => arrangeMode && handleDragEnter(index)}
										onDragEnd={() => arrangeMode && handleDragEnd()}
										onDragOver={(e) => e.preventDefault()}
										onClick={() => {
											if (arrangeMode || isEditing) return
											if (item.type === "link") {
												window.open(item.url, "_blank")
											} else {
												setActiveGalleryIndex(index)
												setGalleryOpen(true)
											}
										}}>
										{/* Folder-style card with stacked effect */}
										<div className="relative flex h-full flex-col overflow-visible transition-transform group-hover:scale-105">
											{/* Top tab bar - darker gray, behind the card */}
											<div className="absolute -top-1 left-3 right-3 z-0 h-5 rounded-t-lg bg-gray-400 dark:bg-slate-700 shadow-sm" />

											{/* Card body - color-coded card in front, overlapping the gray tab */}
											<div className={`relative flex h-full flex-col rounded-lg ${colorConfig.bgColor} border ${colorConfig.borderColor} shadow-sm z-10 mt-1`}>
												<div className="flex min-h-[160px] flex-1 flex-col px-5 pb-5 pt-5">

													{/* Arrange-mode drag handle */}
													{arrangeMode && (
														<div className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground">
															<GripVertical className="h-4 w-4" />
														</div>
													)}

													{/* White rectangular field at top with project name / inline edit */}
													<div className="mb-4 w-full rounded-md border border-border bg-white dark:bg-card px-3 py-2 shadow-sm">
														{isEditing ? (
															<div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
																<input
																	autoFocus
																	type="text"
																	value={editDraft}
																	onChange={(e) => setEditDraft(e.target.value)}
																	onKeyDown={(e) => {
																		if (e.key === "Enter") commitEdit(e as any)
																		if (e.key === "Escape") cancelEdit()
																	}}
																	maxLength={80}
																	className="flex-1 min-w-0 bg-transparent text-sm font-medium text-gray-900 dark:text-foreground outline-none"
																/>
																<button
																	type="button"
																	onClick={commitEdit}
																	className="text-green-600 hover:text-green-700 p-0.5"
																	aria-label="Save title">
																	<Check className="h-3.5 w-3.5" />
																</button>
																<button
																	type="button"
																	onClick={cancelEdit}
																	className="text-muted-foreground hover:text-destructive p-0.5"
																	aria-label="Cancel edit">
																	<X className="h-3.5 w-3.5" />
																</button>
															</div>
														) : (
															<div className="flex items-center gap-1 group/title">
																<h4 className="truncate text-base font-medium text-gray-900 dark:text-foreground flex-1">{item.name}</h4>
																{canEdit && !arrangeMode && (
																	<button
																		type="button"
																		onClick={(e) => startEdit(item, e)}
																		className="invisible group-hover/title:visible text-muted-foreground hover:text-foreground p-0.5 shrink-0"
																		aria-label="Edit title">
																		<Edit className="h-3.5 w-3.5" />
																	</button>
																)}
															</div>
														)}
													</div>

													{/* Thumbnail preview if available */}
													{item.thumbnailUrl && (
														<div className="relative mb-2 h-24 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-slate-800 group/thumb">
															<img
																src={item.thumbnailUrl}
																alt={item.name}
																className="h-full w-full object-cover"
															/>
															{/* Swap thumbnail overlay */}
															{canEdit && !arrangeMode && (
																<button
																	type="button"
																	onClick={(e) => startThumbSwap(item.id, e)}
																	className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity text-white text-xs font-medium"
																	aria-label="Swap thumbnail">
																	<ImageIcon className="h-4 w-4" />
																	Swap
																</button>
															)}
														</div>
													)}

													{/* No thumbnail — swap button for items without one */}
													{!item.thumbnailUrl && canEdit && !arrangeMode && (
														<button
															type="button"
															onClick={(e) => startThumbSwap(item.id, e)}
															className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
															aria-label="Add thumbnail">
															<ImageIcon className="h-3.5 w-3.5" />
															Add thumbnail
														</button>
													)}
												</div>
											</div>
										</div>
									</div>
								)
							})}
						</div>
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
						await persistPortfolio(updated)
						toast({ title: "Title updated", variant: "default" })
					}}
					onReorder={async (reordered) => {
						await persistPortfolio(reordered)
						toast({ title: "Order saved", variant: "default" })
					}}
					onSwapThumbnail={async (id, url) => {
						const updated = portfolioList.map((it) => (it.id === id ? { ...it, thumbnailUrl: url } : it))
						await persistPortfolio(updated)
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
					<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
						<div className="flex animate-fade-in items-center gap-2 rounded-lg bg-white p-4 text-sm text-gray-400 shadow-lg">
							<Loader2 className="h-5 w-5 animate-spin" />
							Saving changes...
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default PortfolioSection
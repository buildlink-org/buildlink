import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import PortfolioGallery from "./PortfolioGallery"
import PortfolioEditorDialog from "./PortfolioEditorDialog"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, FolderOpen, Edit, Check, X, Image as ImageIcon, ArrowLeftRight, ChevronLeft, ChevronRight, Trash } from "lucide-react"
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
	const [directViewerMode, setDirectViewerMode] = useState(false)
	const [updating, setUpdating] = useState(false)
	const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>([])
	const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
	const [arrangeMode, setArrangeMode] = useState(false)
	const { toast } = useToast()

	const [activeIndex, setActiveIndex] = useState(0)
	const touchStartX = useRef<number | null>(null)

	const [editingId, setEditingId] = useState<string | null>(null)
	const [editDraft, setEditDraft] = useState("")

	const [swappingId, setSwappingId] = useState<string | null>(null)
	const thumbInputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		setPortfolioList(Array.isArray(profile.portfolio) ? profile.portfolio : [])
	}, [profile.portfolio])

	useEffect(() => {
		if (portfolioList.length > 0 && activeIndex >= portfolioList.length) {
			setActiveIndex(portfolioList.length - 1)
		}
	}, [portfolioList.length, activeIndex])

	const canEdit = canEditProp !== undefined ? canEditProp : false

	const persistPortfolio = async (updated: PortfolioItem[]) => {
		setUpdating(true)
		setPortfolioList(updated)
		await supabase.from("profiles").update({ portfolio: updated }).eq("id", profile.id)
		setUpdating(false)
		if (handleProfileUpdate) handleProfileUpdate()
	}

	const handlePortfolioAdd = async (item: PortfolioItem) => {
		if (portfolioList.length >= 20) {
			toast({
				title: "Portfolio Limit Reached",
				description: "You can upload up to 20 portfolio items.",
				variant: "destructive",
			})
			return
		}

		setUpdating(true)
		const newPortfolio = [...portfolioList, item]
		setPortfolioList(newPortfolio)
		await supabase.from("profiles").update({ portfolio: newPortfolio }).eq("id", profile.id)
		setUpdating(false)
		if (handleProfileUpdate) handleProfileUpdate()
		toast({
			title: "Portfolio updated",
			description: "Your new project was added.",
			variant: "default",
		})
	}

	const handleRemove = async (id: string) => {
		setUpdating(true)
		const newPortfolio = portfolioList.filter((item) => item.id !== id)
		setPortfolioList(newPortfolio)
		await supabase.from("profiles").update({ portfolio: newPortfolio }).eq("id", profile.id)
		setUpdating(false)
		if (handleProfileUpdate) handleProfileUpdate()
		toast({
			title: "Removed",
			description: "The project has been removed.",
			variant: "default",
		})
	}

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
		if (thumbInputRef.current) thumbInputRef.current.value = ""
		await persistPortfolio(updated)
		toast({ title: "Thumbnail updated", variant: "default" })
	}

	const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
		const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
		touchStartX.current = clientX
	}

	const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
		if (touchStartX.current === null) return
		const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX
		const diff = touchStartX.current - clientX
		if (Math.abs(diff) > 40) {
			if (diff > 0) {
				setActiveIndex((prev) => (prev + 1) % portfolioList.length)
			} else {
				setActiveIndex((prev) => (prev - 1 + portfolioList.length) % portfolioList.length)
			}
		}
		touchStartX.current = null
	}

	const getVisibleCards = () => {
		if (portfolioList.length === 0) return []
		if (portfolioList.length === 1) {
			return [{ item: portfolioList[0], index: 0, position: "center" as const }]
		}
		if (portfolioList.length === 2) {
			return [
				{ item: portfolioList[0], index: 0, position: activeIndex === 0 ? ("center" as const) : ("left" as const) },
				{ item: portfolioList[1], index: 1, position: activeIndex === 1 ? ("center" as const) : ("right" as const) },
			]
		}

		const leftIdx = (activeIndex - 1 + portfolioList.length) % portfolioList.length
		const rightIdx = (activeIndex + 1) % portfolioList.length

		return [
			{ item: portfolioList[leftIdx], index: leftIdx, position: "left" as const },
			{ item: portfolioList[activeIndex], index: activeIndex, position: "center" as const },
			{ item: portfolioList[rightIdx], index: rightIdx, position: "right" as const },
		]
	}

	if (!portfolioList || (!canEdit && portfolioList.length === 0 && profile.user_type !== "professional" && profile.user_type !== "student")) return null

	return (
		<Card className="border border-border shadow-sm overflow-hidden transition-all hover:shadow-md h-auto">
			<CardContent className="p-4 sm:p-5 flex flex-col space-y-4">
				{/* Top Header Row */}
				<div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-border/40">
					<div className="flex items-center space-x-2">
						<h3 className="text-lg font-bold text-foreground">Portfolio</h3>
						<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
							{portfolioList.length} {portfolioList.length === 1 ? "item" : "items"}
						</span>
					</div>

					<div className="flex items-center gap-2">
						{canEdit && (
							<>
								<Button
									variant="outline"
									size="sm"
									className="h-8 px-2.5 text-xs gap-1.5"
									onClick={() => setEditorOpen(true)}
									disabled={updating}>
									<Plus className="h-3.5 w-3.5" />
									<span>Add Project</span>
								</Button>
								{portfolioList.length > 1 && (
									<Button
										variant={arrangeMode ? "default" : "ghost"}
										size="sm"
										className="gap-1.5 h-8 text-xs px-2.5"
										onClick={() => setArrangeMode((v) => !v)}
										disabled={updating}
										title={arrangeMode ? "Exit arrange mode" : "Rearrange projects"}>
										<ArrowLeftRight className="h-3.5 w-3.5" />
										<span className="hidden sm:inline">{arrangeMode ? "Done" : "Arrange"}</span>
									</Button>
								)}
								<Button
									variant="ghost"
									size="sm"
									className="h-8 px-2.5 text-xs gap-1.5"
									onClick={() => {
										setDirectViewerMode(false)
										setGalleryOpen(true)
									}}
									disabled={updating || portfolioList.length === 0}
									title="Manage Gallery">
									<Edit className="h-3.5 w-3.5" />
									<span className="hidden sm:inline">Manage</span>
								</Button>
							</>
						)}
					</div>
				</div>

				{arrangeMode && (
					<p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
						Use the gallery manager or arrow controls to reorder cards. Click <strong>Done</strong> to return.
					</p>
				)}

				{/* Horizontal Carousel Cards View */}
				{portfolioList.length === 0 ? (
					<div className="py-8 text-center">
						<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
							<FolderOpen className="h-7 w-7 text-muted-foreground" />
						</div>
						<h4 className="mb-1 text-base font-semibold text-foreground">No projects added yet</h4>
						<p className="mb-4 text-xs text-muted-foreground">Showcase your work, blueprints, or documents</p>
						{canEdit && (
							<Button
								variant="outline"
								onClick={() => setEditorOpen(true)}
								disabled={updating}
								className="rounded-full px-5 text-xs h-8">
								<Plus className="mr-1.5 h-3.5 w-3.5" />
								Add your first project
							</Button>
						)}
					</div>
				) : (
					<div className="relative group/carousel flex flex-col space-y-3">
						{/* Left Navigation Chevron Button (Overlays Image) */}
						{portfolioList.length > 1 && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setActiveIndex((prev) => (prev - 1 + portfolioList.length) % portfolioList.length)}
								className="absolute left-2 sm:left-3 top-[96px] -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xl hover:bg-black/80 hover:text-white z-30 transition-all hover:scale-110 active:scale-95"
								aria-label="Previous project"
								title="Previous project">
								<ChevronLeft className="h-6 w-6" />
							</Button>
						)}

						{/* Right Navigation Chevron Button (Overlays Image) */}
						{portfolioList.length > 1 && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setActiveIndex((prev) => (prev + 1) % portfolioList.length)}
								className="absolute right-2 sm:right-3 top-[96px] -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xl hover:bg-black/80 hover:text-white z-30 transition-all hover:scale-110 active:scale-95"
								aria-label="Next project"
								title="Next project">
								<ChevronRight className="h-6 w-6" />
							</Button>
						)}

						{/* Side-by-Side Horizontal Carousel */}
						<div
							className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch w-full py-1 select-none"
							onTouchStart={handleTouchStart}
							onTouchEnd={handleTouchEnd}
							onMouseDown={handleTouchStart}
							onMouseUp={handleTouchEnd}>
							{getVisibleCards().map(({ item, index, position }) => {
								const isCenter = position === "center"
								const isEditing = editingId === item.id
								const displayImage = item.thumbnailUrl || (item.type === "image" ? item.url : null)

								return (
									<div
										key={item.id}
										onClick={() => {
											if (!isCenter) setActiveIndex(index)
										}}
										className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 ${
											isCenter
												? "border-primary/50 bg-card ring-2 ring-primary/20 shadow-md scale-[1.02] z-10 cursor-default"
												: "border-border/60 bg-muted/30 opacity-75 hover:opacity-100 hover:border-border cursor-pointer scale-95"
										}`}>
										{/* Top Image / Media Banner */}
										<div className="relative h-44 w-full bg-slate-900 overflow-hidden">
											{displayImage ? (
												<img
													src={displayImage}
													alt={item.name}
													className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
												/>
											) : item.type === "pdf" ? (
												<div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 text-white text-center">
													<div className="h-12 w-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mb-2">
														<span className="text-sm font-black text-red-400">PDF</span>
													</div>
													<p className="text-xs font-semibold text-red-200 line-clamp-2">{item.name}</p>
												</div>
											) : (
												<div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white text-center">
													<div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-2">
														<span className="text-sm font-black text-blue-400">LINK</span>
													</div>
													<p className="text-xs font-semibold text-blue-200 line-clamp-2">{item.name}</p>
												</div>
											)}

											{/* Badge overlay on top right */}
											<span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10 z-10">
												{item.type}
											</span>
										</div>

										{/* Bottom Card Body */}
										<div className="flex flex-col justify-between flex-1 p-3.5 bg-card">
											<div>
												{isEditing ? (
													<div className="flex items-center gap-1 mb-1" onClick={(e) => e.stopPropagation()}>
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
															className="flex-1 bg-transparent text-xs font-semibold text-foreground outline-none border-b border-primary"
														/>
														<button type="button" onClick={commitEdit} className="text-green-600 dark:text-green-400 hover:text-green-700 p-0.5">
															<Check className="h-3.5 w-3.5" />
														</button>
														<button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-red-500 p-0.5">
															<X className="h-3.5 w-3.5" />
														</button>
													</div>
												) : (
													<div className="flex items-start justify-between gap-1 mb-1">
														<h4 className="text-sm font-bold text-foreground truncate flex-1">{item.name}</h4>
														{canEdit && isCenter && (
															<button
																type="button"
																onClick={(e) => startEdit(item, e)}
																className="text-muted-foreground hover:text-foreground p-0.5 shrink-0 transition-colors"
																aria-label="Edit title"
																title="Edit title">
																<Edit className="h-3 w-3" />
															</button>
														)}
													</div>
												)}

												<p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
													{item.description || (item.type === "pdf" ? "PDF Document Attachment" : item.type === "link" ? "External Project Link" : "Portfolio Showcase")}
												</p>
											</div>

											<div className="flex items-center justify-between gap-2 pt-3 mt-2 border-t border-border/50">
												<Button
													variant="secondary"
													size="sm"
													onClick={(e) => {
														e.stopPropagation()
														if (item.type === "link") {
															window.open(item.url, "_blank")
														} else {
															setActiveGalleryIndex(index)
															setDirectViewerMode(true)
															setGalleryOpen(true)
														}
													}}
													className="rounded-lg text-xs px-3 py-1 h-7 font-semibold transition-all">
													{item.type === "link" ? "Visit Link" : "Learn More"}
												</Button>

												{canEdit && isCenter && (
													<div className="flex items-center gap-1">
														<button
															type="button"
															onClick={(e) => startThumbSwap(item.id, e)}
															className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
															title="Swap thumbnail">
															<ImageIcon className="h-3.5 w-3.5" />
														</button>
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation()
																handleRemove(item.id)
															}}
															className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
															title="Delete item">
															<Trash className="h-3.5 w-3.5" />
														</button>
													</div>
												)}
											</div>
										</div>
									</div>
								)
							})}
						</div>

						{/* Dot & Counter Pagination */}
						{portfolioList.length > 1 && (
							<div className="flex items-center justify-center gap-3 pt-2">
								<div className="flex items-center gap-1.5">
									{portfolioList.map((_, idx) => (
										<button
											key={idx}
											onClick={() => setActiveIndex(idx)}
											className={`h-2 rounded-full transition-all duration-300 ${
												idx === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
											}`}
											aria-label={`Go to item ${idx + 1}`}
										/>
									))}
								</div>
								<span className="text-xs font-mono font-semibold text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/40 select-none">
									{activeIndex + 1}/{portfolioList.length}
								</span>
							</div>
						)}
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
					directViewerMode={directViewerMode}
					setDirectViewerMode={setDirectViewerMode}
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
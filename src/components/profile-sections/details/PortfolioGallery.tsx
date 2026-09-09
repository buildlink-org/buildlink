import React, { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import PortfolioThumbnail from "./PortfolioThumbnail"
import { Button } from "@/components/ui/button"
import { Trash, FileText, Edit, Check, X, Image as ImageIcon, GripVertical, ArrowLeftRight, ExternalLink } from "lucide-react"
import { PortfolioItem } from "@/types"
import MediaPreview from "@/components/ui/media-preview"
import { supabase } from "@/integrations/supabase/client"


interface PortfolioGalleryProps {
	open: boolean
	setOpen: (open: boolean) => void
	portfolio: PortfolioItem[]
	canEdit?: boolean
	onRemove?: (id: string) => void
	onRename?: (id: string, name: string) => Promise<void>
	onReorder?: (reordered: PortfolioItem[]) => Promise<void>
	onSwapThumbnail?: (id: string, url: string) => Promise<void>
	profileId?: string
	updating?: boolean
	activeIndex?: number
	setActiveIndex?: (i: number) => void
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
	open,
	setOpen,
	portfolio,
	canEdit = false,
	onRemove,
	onRename,
	onReorder,
	onSwapThumbnail,
	profileId,
	updating = false,
	activeIndex = 0,
	setActiveIndex,
}) => {
	const scrollRef = useRef<HTMLDivElement>(null)
	const [pdfViewerOpen, setPdfViewerOpen] = useState(false)

	// Inline rename
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editDraft, setEditDraft] = useState("")

	// Thumbnail swap
	const [swappingId, setSwappingId] = useState<string | null>(null)
	const thumbInputRef = useRef<HTMLInputElement | null>(null)
	const [thumbUploading, setThumbUploading] = useState(false)

	// Arrange mode (drag-to-reorder inside the gallery)
	const [arrangeMode, setArrangeMode] = useState(false)
	const dragItem = useRef<number | null>(null)
	const dragOverItem = useRef<number | null>(null)
	// Local reorder buffer so we can show the new order immediately
	const [localOrder, setLocalOrder] = useState<PortfolioItem[]>([])

	useEffect(() => {
		setLocalOrder(portfolio)
	}, [portfolio])

	const activeItem = useMemo(() => {
		return localOrder?.[activeIndex]
	}, [localOrder, activeIndex])

	useEffect(() => {
		if (!open) return
		setTimeout(() => {
			if (scrollRef.current) {
				const items = scrollRef.current.querySelectorAll(".portfolio-gallery-item")
				if (items[activeIndex]) {
					;(items[activeIndex] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" })
				}
			}
		}, 100)
	}, [open, activeIndex, portfolio.length])

	// Reset local state when gallery closes
	useEffect(() => {
		if (!open) {
			setEditingId(null)
			setArrangeMode(false)
		}
	}, [open])

	const [scrollIndex, setScrollIndex] = useState(0)
	const [viewerOpen, setViewerOpen] = useState(false)
	const [viewerIndex, setViewerIndex] = useState(0)

	const openViewer = (index: number) => {
		setViewerIndex(index)
		setViewerOpen(true)
	}

	const handleViewerPrev = () => {
		setViewerIndex((prev) => (prev - 1 + localOrder.length) % localOrder.length)
	}

	const handleViewerNext = () => {
		setViewerIndex((prev) => (prev + 1) % localOrder.length)
	}

	// Keyboard arrow navigation in viewer
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!viewerOpen) return
			if (e.key === "ArrowLeft") handleViewerPrev()
			if (e.key === "ArrowRight") handleViewerNext()
			if (e.key === "Escape") setViewerOpen(false)
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [viewerOpen, localOrder.length])

	const handleItemClick = (item: any, index: number) => {
		if (editingId || arrangeMode) return
		if (setActiveIndex) setActiveIndex(index)
		openViewer(index)
	}

	// ── Inline rename ────────────────────────────────────────────────────────
	const startEdit = (item: PortfolioItem, e: React.MouseEvent) => {
		e.stopPropagation()
		setEditingId(item.id)
		setEditDraft(item.name)
	}

	const commitEdit = async (e?: React.MouseEvent | React.KeyboardEvent) => {
		e?.stopPropagation()
		if (!editingId || !onRename) return
		const name = editDraft.trim()
		if (name) await onRename(editingId, name)
		setEditingId(null)
	}

	const cancelEdit = (e?: React.MouseEvent) => {
		e?.stopPropagation()
		setEditingId(null)
	}

	// ── Thumbnail swap ───────────────────────────────────────────────────────
	const startThumbSwap = (id: string, e: React.MouseEvent) => {
		e.stopPropagation()
		setSwappingId(id)
		thumbInputRef.current?.click()
	}

	const handleThumbFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file || !swappingId || !profileId) return

		setThumbUploading(true)
		const ext = file.name.split(".").pop()
		const filename = `${profileId}/thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
		const { data, error } = await supabase.storage.from("portfolio").upload(filename, file, { upsert: false })
		setThumbUploading(false)
		if (error || !data) {
			setSwappingId(null)
			return
		}
		const { data: pub } = supabase.storage.from("portfolio").getPublicUrl(filename)
		if (onSwapThumbnail) await onSwapThumbnail(swappingId, pub.publicUrl)
		setSwappingId(null)
		if (thumbInputRef.current) thumbInputRef.current.value = ""
	}

	// ── Drag-to-reorder ──────────────────────────────────────────────────────
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
		const reordered = [...localOrder]
		const [moved] = reordered.splice(dragItem.current, 1)
		reordered.splice(dragOverItem.current, 0, moved)
		dragItem.current = null
		dragOverItem.current = null
		setLocalOrder(reordered)
		if (onReorder) await onReorder(reordered)
	}

	const renderPortfolioCard = (item: any, index: number) => {
		const isEditing = editingId === item.id

		// Title row — shared between card types
		const titleRow = (
			<div className="flex items-center gap-1 group/title">
				{isEditing ? (
					<div className="flex flex-1 items-center gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
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
							className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-foreground outline-none border-b border-primary"
						/>
						<button type="button" onClick={commitEdit} className="text-green-600 hover:text-green-700 p-0.5" aria-label="Save">
							<Check className="h-3.5 w-3.5" />
						</button>
						<button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-destructive p-0.5" aria-label="Cancel">
							<X className="h-3.5 w-3.5" />
						</button>
					</div>
				) : (
					<>
						<span className="line-clamp-2 flex-1 text-sm font-semibold text-foreground">{item.name}</span>
						{canEdit && onRename && !arrangeMode && (
							<button
								type="button"
								onClick={(e) => startEdit(item, e)}
								className="invisible group-hover/title:visible shrink-0 p-0.5 text-muted-foreground hover:text-foreground"
								aria-label="Edit title">
								<Edit className="h-3.5 w-3.5" />
							</button>
						)}
					</>
				)}
			</div>
		)

		// For PDFs and links, show simple card
		if (item.type === "pdf" || item.type === "link") {
			return (
				<div
					className="cursor-pointer rounded-xl border-2 border-border bg-card p-6 transition-colors hover:bg-accent"
					onClick={() => handleItemClick(item, index)}>
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
							{item.type === "pdf" ? <FileText className="h-8 w-8 text-red-500" /> : <ExternalLink className="h-8 w-8 text-blue-500" />}
						</div>
						<div className="w-full space-y-2">
							{titleRow}
							{item.description && <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}
							<span className={`inline-block text-xs px-2 py-1 rounded-md font-medium ${item.type === "pdf" ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"}`}>
								{item.type === "pdf" ? "PDF Document" : "External Link"}
							</span>
						</div>
					</div>
				</div>
			)
		}

		// For images: show thumbnail + swap overlay
		return (
			<div
				className="cursor-pointer transition-transform hover:scale-105"
				onClick={() => handleItemClick(item, index)}>
				<div className="relative group/card">
					<PortfolioThumbnail
						type={item.type}
						url={item.url}
						name={item.name}
						thumbnailUrl={item.thumbnailUrl}
					/>
					{/* Swap thumbnail overlay */}
					{canEdit && onSwapThumbnail && !arrangeMode && (
						<button
							type="button"
							onClick={(e) => startThumbSwap(item.id, e)}
							className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity text-white text-xs font-medium rounded-t-xl"
							aria-label="Swap thumbnail">
							<ImageIcon className="h-5 w-5" />
							{thumbUploading && swappingId === item.id ? "Uploading…" : "Swap thumbnail"}
						</button>
					)}
				</div>
				<div className="min-h-[68px] border-t border-border bg-muted/40 px-3 py-3">
					{titleRow}
					{item.description && <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</div>}
					<span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-950/60 dark:text-green-300">{item.type.toUpperCase()}</span>
				</div>
			</div>
		)
	}

	const currentViewerItem = localOrder[viewerIndex]

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className="w-[calc(100vw-2rem)] max-w-4xl rounded-xl shadow-lg p-4 sm:p-6"
					description="View, rearrange, rename, or remove your portfolio projects">
					<DialogHeader className="flex-row items-center justify-between gap-2 flex-wrap">
						<DialogTitle className="text-lg font-semibold">Portfolio Projects</DialogTitle>
						{canEdit && localOrder.length > 1 && (
							<Button
								variant={arrangeMode ? "default" : "outline"}
								size="sm"
								className="gap-2 text-xs"
								onClick={() => setArrangeMode((v) => !v)}>
								<ArrowLeftRight className="h-3.5 w-3.5" />
								{arrangeMode ? "Done arranging" : "Arrange"}
							</Button>
						)}
					</DialogHeader>

					{arrangeMode && (
						<p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
							Drag cards to reorder. Click <strong>Done arranging</strong> when finished.
						</p>
					)}

					<div
						ref={scrollRef}
						className="my-3 grid max-h-[68vh] grid-cols-1 gap-6 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
						{localOrder.map((item, i) => (
							<div
								key={item.id}
								className={`portfolio-gallery-item space-y-3 ${arrangeMode ? "cursor-grab active:cursor-grabbing" : ""}`}
								draggable={arrangeMode}
								onDragStart={() => arrangeMode && handleDragStart(i)}
								onDragEnter={() => arrangeMode && handleDragEnter(i)}
								onDragEnd={() => arrangeMode && handleDragEnd()}
								onDragOver={(e) => e.preventDefault()}>
								{arrangeMode && (
									<div className="flex items-center gap-1 text-xs text-muted-foreground px-1">
										<GripVertical className="h-3.5 w-3.5" />
										<span>Drag to reorder</span>
									</div>
								)}
								<div className={`overflow-hidden rounded-xl`}>{renderPortfolioCard(item, i)}</div>

								{/* Delete button below each item */}
								{canEdit && typeof onRemove === "function" && !arrangeMode && (
									<Button
										variant="outline"
										size="sm"
										className="w-full border-red-600 text-red-600 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950/40"
										onClick={(e) => {
											e.stopPropagation()
											onRemove(item.id)
										}}
										disabled={updating}>
										<Trash className="mr-2 h-4 w-4" />
										Remove
									</Button>
								)}
							</div>
						))}
					</div>

					{/* Hidden file input for thumbnail swap */}
					<input
						type="file"
						accept="image/*"
						ref={thumbInputRef}
						onChange={handleThumbFileChange}
						className="sr-only"
						tabIndex={-1}
					/>

					<DialogClose asChild>
						<Button
							variant="outline"
							size="lg"
							className="mt-3 w-full font-semibold">
							Close
						</Button>
					</DialogClose>
				</DialogContent>
			</Dialog>

			{/* Sideways Carousel Project View Screen */}
			{currentViewerItem && (
				<Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
					<DialogContent showCloseButton={false} className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-0 bg-slate-950/95 text-white border-none flex flex-col justify-between overflow-hidden shadow-2xl">
						{/* Top Header */}
						<div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-50">
							<div className="flex items-center space-x-3 min-w-0 flex-1">
								<h3 className="text-base sm:text-lg font-bold text-white truncate">{currentViewerItem.name}</h3>
								<span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/20 text-primary-foreground border border-primary/30 shrink-0">
									{currentViewerItem.type.toUpperCase()}
								</span>
							</div>

							<div className="flex items-center space-x-3 shrink-0">
								{localOrder.length > 1 && (
									<span className="text-xs text-gray-400 font-mono">
										{viewerIndex + 1} / {localOrder.length}
									</span>
								)}
								<Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/20 rounded-full" onClick={() => setViewerOpen(false)}>
									<X className="h-5 w-5" />
								</Button>
							</div>
						</div>

						{/* Main Content Area */}
						<div className="relative flex-1 w-full h-full flex items-center justify-center p-4 overflow-hidden">
							{/* Content based on type */}
							{currentViewerItem.type === "pdf" ? (
								<div className="w-full h-full max-h-[75vh] rounded-lg overflow-hidden border border-white/10 bg-white">
									<MediaPreview url={currentViewerItem.url} type="pdf" name={currentViewerItem.name} size="lg" showActions />
								</div>
							) : currentViewerItem.type === "link" ? (
								<div className="flex flex-col items-center justify-center text-center p-8 bg-slate-900/60 rounded-2xl border border-white/10 max-w-lg">
									<ExternalLink className="h-16 w-16 text-blue-400 mb-4" />
									<h4 className="text-xl font-bold mb-2 text-white">{currentViewerItem.name}</h4>
									{currentViewerItem.description && <p className="text-sm text-gray-300 mb-6">{currentViewerItem.description}</p>}
									<Button onClick={() => window.open(currentViewerItem.url, "_blank", "noopener,noreferrer")} className="gap-2">
										<ExternalLink className="h-4 w-4" /> Open Project Link
									</Button>
								</div>
							) : (
								<img
									src={currentViewerItem.url}
									alt={currentViewerItem.name}
									className="max-h-[75vh] max-w-[85vw] object-contain rounded-lg shadow-2xl"
								/>
							)}

							{/* Left Arrow */}
							{localOrder.length > 1 && (
								<button
									type="button"
									onClick={handleViewerPrev}
									className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 z-40 transition-transform active:scale-95"
									aria-label="Previous item"
								>
									‹
								</button>
							)}

							{/* Right Arrow */}
							{localOrder.length > 1 && (
								<button
									type="button"
									onClick={handleViewerNext}
									className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 z-40 transition-transform active:scale-95"
									aria-label="Next item"
								>
									›
								</button>
							)}
						</div>

						{/* Bottom Thumbnail Ribbon */}
						{localOrder.length > 1 && (
							<div className="p-3 bg-slate-900/80 backdrop-blur-md border-t border-white/10 flex items-center justify-center space-x-2 overflow-x-auto z-50">
								{localOrder.map((item, idx) => (
									<button
										key={item.id}
										onClick={() => setViewerIndex(idx)}
										className={`relative h-12 w-16 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
											idx === viewerIndex ? "border-primary scale-105 shadow-md" : "border-transparent opacity-50 hover:opacity-100"
										}`}
									>
										{item.type === "pdf" ? (
											<div className="w-full h-full bg-red-950/80 flex items-center justify-center text-[10px] font-bold text-red-300">
												PDF
											</div>
										) : item.type === "link" ? (
											<div className="w-full h-full bg-blue-950/80 flex items-center justify-center text-[10px] font-bold text-blue-300">
												LINK
											</div>
										) : (
											<img src={item.url} alt={item.name} className="w-full h-full object-cover" />
										)}
									</button>
								))}
							</div>
						)}
					</DialogContent>
				</Dialog>
			)}
		</>
	)
}

export default PortfolioGallery
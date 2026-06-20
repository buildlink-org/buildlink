import React, { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import PortfolioThumbnail from "./PortfolioThumbnail"
import { Button } from "@/components/ui/button"
import { Trash, FileText, Edit, Check, X, Image as ImageIcon, GripVertical, ArrowLeftRight } from "lucide-react"
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

	const handleItemClick = (item: any, index: number) => {
		if (editingId || arrangeMode) return
		if (setActiveIndex) setActiveIndex(index)

		// Links: open externally
		if (item.type === "link") {
			window.open(item.url, "_blank", "noopener,noreferrer")
			return
		}

		// PDFs: open in-app viewer
		if (item.type === "pdf") {
			setPdfViewerOpen(true)
			return
		}
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
							className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-gray-900 outline-none border-b border-primary"
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
						<span className="line-clamp-2 flex-1 text-sm font-semibold text-gray-900">{item.name}</span>
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
					className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50"
					onClick={() => handleItemClick(item, index)}>
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
							{item.type === "pdf" ? <FileText className="h-8 w-8 text-red-500" /> : <ExternalLink className="h-8 w-8 text-blue-500" />}
						</div>
						<div className="w-full space-y-2">
							{titleRow}
							{item.description && <p className="line-clamp-2 text-xs text-gray-500">{item.description}</p>}
							<span className={`inline-block text-xs px-2 py-1 rounded-md font-medium ${item.type === "pdf" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
								{item.type === "pdf" ? "PDF" : "Link"}
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
				<div className="min-h-[68px] border-t bg-muted/40 px-3 py-3">
					{titleRow}
					{item.description && <div className="mt-1 line-clamp-2 text-xs text-gray-500">{item.description}</div>}
					<span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">{item.type.toUpperCase()}</span>
				</div>
			</div>
		)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogContent className="w-[calc(100vw-2rem)] max-w-4xl rounded-xl shadow-lg p-4 sm:p-6">
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

				{/* In-app PDF viewer */}
				{activeItem?.type === "pdf" && (
					<Dialog open={pdfViewerOpen} onOpenChange={setPdfViewerOpen}>
						<DialogContent className="max-w-6xl h-[85vh] p-6">
							<DialogHeader>
								<DialogTitle className="text-lg font-semibold">
									{activeItem.name}
								</DialogTitle>
							</DialogHeader>
							<div className="h-[calc(85vh-6.5rem)]">
								<MediaPreview
									url={activeItem.url}
									type="pdf"
									name={activeItem.name}
									size="lg"
									showActions
								/>
							</div>
						</DialogContent>
					</Dialog>
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
									className="w-full border-red-600 text-red-600 hover:border-red-300 hover:bg-red-50"
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
	)
}

export default PortfolioGallery
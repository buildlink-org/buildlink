import React from "react"
import { FileText, File, Image as ImageIcon, Eye, ArrowUp, ArrowDown, RefreshCcw, ExternalLink } from "lucide-react"
import { PortfolioItem } from "@/types"

interface FeaturedProjectCardProps {
	item: PortfolioItem
	arrangeMode?: boolean
	updating?: boolean
	onOpen: () => void
	/** Swap / change the card thumbnail (edit mode) */
	onSwapThumbnail?: () => void
	/** Keyboard-accessible reorder (arrange mode) */
	onMoveUp?: () => void
	onMoveDown?: () => void
}

/**
 * Image-led project card used in the Featured Projects grid.
 * 16:10 cover image, type/status overlay, role · location · year metadata,
 * one-line outcome, hover "View project".
 */
const FeaturedProjectCard: React.FC<FeaturedProjectCardProps> = ({
	item,
	arrangeMode = false,
	updating = false,
	onOpen,
	onSwapThumbnail,
	onMoveUp,
	onMoveDown,
}) => {
	const metaLine = [item.role, item.location].filter(Boolean).join(" · ")
	const typeLine = [item.year, item.projectType].filter(Boolean).join(" · ")
	const badgeText = item.projectType || item.status || "Project"
	const canRenderImage = item.thumbnailUrl || item.type === "image" || item.type === "gif"

	return (
		<article
			className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-ring ${
				arrangeMode ? "border-dashed" : ""
			}`}
			aria-label={item.name}>
			{/* Thumbnail swap (edit mode) — sibling of the media button so buttons are never nested (valid HTML + keyboard a11y) */}
			{onSwapThumbnail && !arrangeMode && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						onSwapThumbnail()
					}}
					disabled={updating}
					className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40"
					title="Swap thumbnail"
					aria-label={`Swap thumbnail for ${item.name}`}>
					<RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
				</button>
			)}
			{/* Media / image area */}
			<button
				type="button"
				onClick={onOpen}
				disabled={updating}
				aria-label={`View project ${item.name}`}
				className="relative block aspect-[16/10] w-full overflow-hidden bg-muted text-left disabled:pointer-events-none">
				{canRenderImage ? (
					<img
						src={item.thumbnailUrl || item.url}
						alt={item.name}
						loading="lazy"
						className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
					/>
				) : item.type === "pdf" ? (
					<div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-red-50 to-red-100 p-4 dark:from-red-950/40 dark:to-red-950/20">
						<FileText className="h-8 w-8 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
						<span className="truncate text-[11px] font-medium text-red-900 dark:text-red-200">
							{item.name.replace(/\.[^/.]+$/, "")}
						</span>
					</div>
				) : item.type === "link" ? (
					<div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-950/40 dark:to-blue-950/20">
						<ExternalLink className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
						<span className="truncate text-[11px] font-medium text-blue-900 dark:text-blue-200">{item.name}</span>
					</div>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted">
						<ImageIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
					</div>
				)}

				{/* Type / status badge overlay */}
				<span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
					{badgeText}
				</span>

				{/* Hover: view project */}
				<span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
					<span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
						<Eye className="h-3.5 w-3.5" aria-hidden="true" />
						View project
					</span>
				</span>
			</button>

			{/* Card body */}
			<div className="flex flex-1 flex-col p-4">
				<h4 className="truncate text-sm font-semibold text-foreground">{item.name}</h4>
				{metaLine && <p className="mt-0.5 truncate text-xs text-muted-foreground">{metaLine}</p>}
				{typeLine && (
					<p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
						<File className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
						<span className="truncate">{typeLine}</span>
					</p>
				)}
				{item.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}

				{/* Keyboard-accessible reorder (arrange mode) */}
				{arrangeMode && (onMoveUp || onMoveDown) && (
					<div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-2">
						{onMoveUp && (
							<button
								type="button"
								onClick={onMoveUp}
								disabled={updating}
								className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
								aria-label={`Move ${item.name} up`}
								title="Move up">
								<ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
							</button>
						)}
						{onMoveDown && (
							<button
								type="button"
								onClick={onMoveDown}
								disabled={updating}
								className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
								aria-label={`Move ${item.name} down`}
								title="Move down">
								<ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
							</button>
						)}
					</div>
				)}
			</div>
		</article>
	)
}

export default FeaturedProjectCard

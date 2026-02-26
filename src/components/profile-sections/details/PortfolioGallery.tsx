import React, { useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import PortfolioThumbnail from "./PortfolioThumbnail"
import { Button } from "@/components/ui/button"
import { Trash, FileText, ExternalLink } from "lucide-react"
import { PortfolioItem } from "@/types"

interface PortfolioGalleryProps {
	open: boolean
	setOpen: (open: boolean) => void
	portfolio: PortfolioItem[]
	canEdit?: boolean
	onRemove?: (id: string) => void
	updating?: boolean
	activeIndex?: number
	setActiveIndex?: (i: number) => void
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ open, setOpen, portfolio, canEdit = false, onRemove, updating = false, activeIndex = 0, setActiveIndex }) => {
	const scrollRef = useRef<HTMLDivElement>(null)

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

	const handleItemClick = (item: any, index: number) => {
		if (setActiveIndex) setActiveIndex(index)

		// For PDFs and links, just open in new tab
		if (item.type === "pdf" || item.type === "link") {
			window.open(item.url, "_blank")
			return
		}
	}

	const renderPortfolioCard = (item: any, index: number) => {
		// For PDFs and links, show simple card
		if (item.type === "pdf" || item.type === "link") {
			return (
				<div
					className="cursor-pointer rounded-xl border-2 border-gray-200 bg-white p-6 transition-colors hover:bg-gray-50"
					onClick={() => handleItemClick(item, index)}>
					<div className="flex flex-col items-center space-y-4 text-center">
						<div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">{item.type === "pdf" ? <FileText className="h-8 w-8 text-red-500" /> : <ExternalLink className="h-8 w-8 text-blue-500" />}</div>
						<div className="space-y-2">
							<h4 className="line-clamp-2 text-sm font-semibold text-gray-900">{item.type === "pdf" ? item.name.replace(/\.(pdf|PDF)$/, "") : item.name}</h4>
							{item.description && <p className="line-clamp-2 text-xs text-gray-500">{item.description}</p>}
							<span className={`inline-block text-xs px-2 py-1 rounded-md font-medium ${item.type === "pdf" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{item.type === "pdf" ? "PDF" : "Link"}</span>
						</div>
					</div>
				</div>
			)
		}

		// For other types (images, etc.), use the thumbnail
		return (
			<div
				className="cursor-pointer transition-transform hover:scale-105"
				onClick={() => handleItemClick(item, index)}>
				<PortfolioThumbnail
					type={item.type}
					url={item.url}
					name={item.name}
					thumbnailUrl={item.thumbnailUrl}
				/>
				<div className="min-h-[68px] border-t bg-muted/40 px-3 py-3">
					<div className="truncate text-sm font-semibold text-gray-900">{item.name}</div>
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
			<DialogContent className="max-w-4xl rounded-xl shadow-lg">
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold">Portfolio Projects</DialogTitle>
				</DialogHeader>
				<div
					ref={scrollRef}
					className="my-3 grid max-h-[68vh] grid-cols-1 gap-6 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
					{portfolio.map((item, i) => (
						<div
							key={item.id}
							className="portfolio-gallery-item space-y-3">
							<div className={`overflow-hidden rounded-xl`}>{renderPortfolioCard(item, i)}</div>

							{/* Delete button below each item */}
							{canEdit && typeof onRemove === "function" && (
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

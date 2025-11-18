import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import MediaPreview from "@/components/ui/media-preview"
import PortfolioGallery from "./PortfolioGallery"
import PortfolioEditorDialog from "./PortfolioEditorDialog"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, FolderOpen, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { MoveRight } from "lucide-react"
import { UserProfile } from "@/types"

type PortfolioItem = {
	id: string
	name: string
	url: string
	type: string
	description?: string
	thumbnailUrl?: string
}

interface PortfolioSectionProps {
	profile: UserProfile
	handleProfileUpdate: () => void
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({ profile, handleProfileUpdate }) => {
	const [editorOpen, setEditorOpen] = useState(false)
	const [galleryOpen, setGalleryOpen] = useState(false)
	const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
	const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>("")
	const [selectedPdfName, setSelectedPdfName] = useState<string>("")
	const [updating, setUpdating] = useState(false)
	const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>([])
	const [activeGalleryIndex, setActiveGalleryIndex] = useState(0)
	const { toast } = useToast()

	useEffect(() => {
		setPortfolioList(Array.isArray(profile.portfolio) ? profile.portfolio : [])
	}, [profile.portfolio])

	const canEdit = true

	const handlePortfolioAdd = async (item: PortfolioItem) => {
		// Check PDF limit
		const currentPdfCount = portfolioList.filter((p) => p.type === "pdf").length
		if (item.type === "pdf" && currentPdfCount >= 5) {
			toast({
				title: "PDF Limit Reached",
				description: "You can only upload up to 5 PDF files in your portfolio.",
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

	if (!portfolioList) return null

	return (
		<Card className="border-0 shadow-sm">
			<CardContent className="px-0 py-6">
				<div className="mb-6 flex flex-wrap items-center justify-between gap-y-2">
					<div className="flex items-center space-x-2">
						<h3 className="text-lg font-semibold text-foreground">Portfolio</h3>
						<span className="text-sm text-muted-foreground">({portfolioList.length}/5 portfolio items uploaded)</span>
					</div>
					{canEdit && (
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								className="gap-2"
								onClick={() => setGalleryOpen(true)}
								disabled={updating || portfolioList.length === 0}>
								<Edit className="h-4 w-4" />
								Edit
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="gap-2"
								onClick={() => setEditorOpen(true)}
								disabled={updating}>
								<Plus className="h-4 w-4" />
								Add Project
							</Button>
						</div>
					)}
				</div>
				{portfolioList.length === 0 ? (
					<div className="py-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
							<FolderOpen className="h-8 w-8 text-muted-foreground" />
						</div>
						<h4 className="mb-2 text-lg font-medium text-foreground">No projects yet</h4>
						<p className="mb-6 text-muted-foreground">Showcase your work and achievements</p>
						{canEdit && (
							<Button
								variant="outline"
								onClick={() => setEditorOpen(true)}
								disabled={updating}>
								<Plus className="mr-2 h-4 w-4" />
								Add your first project
							</Button>
						)}
					</div>
				) : (
					<div className="space-y-6">
						{/* Enhanced Portfolio Grid */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{portfolioList.map((item, index) => (
								<div
									key={item.id}
									className="cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all duration-200"
									onClick={() => {
										if (item.type === "pdf") {
											setSelectedPdfUrl(item.url)
											setSelectedPdfName(item.name.replace(/\.(pdf|PDF)$/, ""))
											setPdfViewerOpen(true)
										} else if (item.type === "link") {
											window.open(item.url, "_blank")
										} else {
											setActiveGalleryIndex(index)
											setGalleryOpen(true)
										}
									}}>
									<div className="p-4">
										<h4 className="py-4 font-semibold">{item.name.replace(/\.(pdf|PDF)$/, "")}</h4>
										{item.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
										<div className="mt-2 flex items-center justify-between">
											<span className={`text-xs text-muted-foreground capitalize px-2 py-1 rounded ${item.type === "pdf" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>{item.type === "pdf" ? "PDF" : item.type}</span>
											<MoveRight className="h-4 w-4" />
											{/* {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(item.id);
                          }}
                          className="p-1 text-destructive opacity-0 transition-all hover:text-destructive/80 group-hover:opacity-100"
                          disabled={updating}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )} */}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
				<PortfolioGallery
					open={galleryOpen}
					setOpen={setGalleryOpen}
					portfolio={portfolioList}
					activeIndex={activeGalleryIndex}
					setActiveIndex={setActiveGalleryIndex}
					canEdit={canEdit}
					onRemove={handleRemove}
					updating={updating}
				/>

				{/* PDF Viewer Dialog */}
				<Dialog
					open={pdfViewerOpen}
					onOpenChange={setPdfViewerOpen}>
					<DialogContent className="flex h-[90vh] w-full max-w-6xl flex-col">
						<div className="min-h-0 flex-1">
							<MediaPreview
								url={selectedPdfUrl}
								type="pdf"
								name={selectedPdfName}
								className="h-full w-full"
								showActions={true}
							/>
						</div>
					</DialogContent>
				</Dialog>

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

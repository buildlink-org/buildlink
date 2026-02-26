import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import PortfolioGallery from "./PortfolioGallery"
import PortfolioEditorDialog from "./PortfolioEditorDialog"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, FolderOpen, Edit } from "lucide-react"
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
	const { toast } = useToast()

	useEffect(() => {
		setPortfolioList(Array.isArray(profile.portfolio) ? profile.portfolio : [])
	}, [profile.portfolio])

	const canEdit = canEditProp !== undefined ? canEditProp : false

	// Get account-type-specific colors matching ProfileHeader
	const getColorConfig = () => {
		const userType = profile?.user_type?.toLowerCase() || "student"

		if (userType === "student") {
			return {
				bgColor: "bg-yellow-100",
				borderColor: "border-yellow-50",
			}
		} else if (userType === "professional") {
			return {
				bgColor: "bg-[#FFCBA4]",
				borderColor: "border-[#FFCBA4]",
			}
		} else if (userType === "company") {
			return {
				bgColor: "bg-green-200",
				borderColor: "border-green-200",
			}
		}
		// Default fallback
		return {
			bgColor: "bg-gradient-to-r from-blue-50 to-indigo-50",
			borderColor: "border-blue-200",
		}
	}

	const colorConfig = getColorConfig()

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

								return (
									<div
										key={item.id}
										className={`cursor-pointer group ${cardClasses}`}
										onClick={() => {
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
											<div className="absolute -top-1 left-3 right-3 z-0 h-5 rounded-t-lg bg-gray-400 shadow-sm" />

											{/* Card body - color-coded card in front, overlapping the gray tab */}
											<div className={`relative flex h-full flex-col rounded-lg ${colorConfig.bgColor} border ${colorConfig.borderColor} shadow-sm z-10 mt-1`}>
												<div className="flex min-h-[160px] flex-1 flex-col px-5 pb-5 pt-5">
													{/* White rectangular field at top with project name */}
													<div className="mb-4 w-full rounded-md border border-border bg-white px-4 py-3 shadow-sm">
														<h4 className="truncate text-base font-medium text-gray-900">{item.name}</h4>
													</div>

													{/* Thumbnail preview if available */}
													{item.thumbnailUrl && (
														<div className="mb-2 h-24 w-full overflow-hidden rounded-md bg-gray-100">
															<img
																src={item.thumbnailUrl}
																alt={item.name}
																className="h-full w-full object-cover"
															/>
														</div>
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

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useIsMobile } from "@/hooks/use-mobile"
import PostTypeSelector from "./PostTypeSelector"
import UserAvatarHeader from "./UserAvatarHeader"
import { useAuth } from "@/contexts/AuthContext"
import { postsService } from "@/services/postsService"
import { draftsService } from "@/services/draftsService"
import { useToast } from "@/hooks/use-toast"
import {
	uploadPostImages,
	uploadPostDocument,
} from "@/lib/uploadUtils"
import {
	MediaItem,
	MediaUploader,
	MediaLayoutEditor,
	getPostImageFiles,
} from "@/components/media"
import {
	OPPORTUNITY_TYPES,
	EXPERIENCE_LEVELS,
	OpportunityType,
	ExperienceLevel,
	PostCategory,
} from "@/types/posts"

export const PostCreate = () => {
	const { user } = useAuth()
	const { toast } = useToast()
	const isMobile = useIsMobile()

	// Post type: "express" | "project" | "opportunity"
	const [postType, setPostType] = useState<"express" | "project" | "opportunity">("express")

	// Express Yourself state
	const [expressContent, setExpressContent] = useState("")

	// Showcase Project state
	const [projectTitle, setProjectTitle] = useState("")
	const [projectTimeline, setProjectTimeline] = useState("")
	const [projectSubjectMatter, setProjectSubjectMatter] = useState("")

	// Post Opportunity state
	const [opportunityTitle, setOpportunityTitle] = useState("")
	const [opportunityCompany, setOpportunityCompany] = useState("")
	const [opportunityLocation, setOpportunityLocation] = useState("")
	const [opportunityType, setOpportunityType] = useState<OpportunityType>("Full Time")
	const [opportunityExperience, setOpportunityExperience] = useState<ExperienceLevel>("Competent")
	const [opportunityDescription, setOpportunityDescription] = useState("")

	// Media state
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
	const [layoutEditorOpen, setLayoutEditorOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [isSavingDraft, setIsSavingDraft] = useState(false)

	const mediaItemsRef = useRef(mediaItems)
	mediaItemsRef.current = mediaItems

	// Clean up object URLs on component unmount only to prevent premature cache eviction across browsers
	useEffect(() => {
		return () => {
			mediaItemsRef.current.forEach((item) => {
				if (item.previewUrl?.startsWith("blob:")) {
					URL.revokeObjectURL(item.previewUrl)
				}
			})
		}
	}, [])

	// Switch post type handler
	const handlePostTypeChange = (newType: string) => {
		const resolvedType =
			newType === "general" || newType === "industry"
				? "express"
				: newType === "career"
				? "opportunity"
				: (newType as "express" | "project" | "opportunity")

		// If switching to Opportunity, remove any uploaded PDF since Opportunity does not permit PDFs
		if (resolvedType === "opportunity") {
			const withoutPdf = mediaItems.filter((item) => {
				if (item.type === "pdf") {
					if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
					return false
				}
				return true
			})
			setMediaItems(withoutPdf)
		}

		setPostType(resolvedType)
	}

	const resetForm = useCallback(() => {
		mediaItems.forEach((item) => {
			if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
		})
		setMediaItems([])
		setExpressContent("")
		setProjectTitle("")
		setProjectTimeline("")
		setProjectSubjectMatter("")
		setOpportunityTitle("")
		setOpportunityCompany("")
		setOpportunityLocation("")
		setOpportunityType("Full Time")
		setOpportunityExperience("Competent")
		setOpportunityDescription("")
	}, [mediaItems])

	const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		resetForm()
		toast({
			title: "Cancelled",
			description: "Post creation cancelled and fields reset.",
		})
	}

	// Create Later (Drafts)
	const handleCreateLater = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (!user || isSavingDraft) return

		setIsSavingDraft(true)
		try {
			let contentToSave = ""
			let categoryToSave: PostCategory = "project"

			if (postType === "project") {
				categoryToSave = "project"
				contentToSave = `### ${projectTitle.trim() || "Untitled Project"}\n${
					projectTimeline.trim() ? `Timeline: ${projectTimeline.trim()}\n\n` : ""
				}${projectSubjectMatter.trim()}`
			} else if (postType === "opportunity") {
				categoryToSave = "opportunity"
				contentToSave = `### ${opportunityTitle.trim() || "Untitled Opportunity"}\n🏢 ${
					opportunityCompany.trim() || "Undisclosed"
				}\n📍 ${opportunityLocation.trim() || "Undisclosed"}\n💼 Type: ${opportunityType} • 🎯 Experience: ${opportunityExperience}\n\n${opportunityDescription.trim()}`
			} else {
				categoryToSave = "industry"
				contentToSave = expressContent.trim()
			}

			const { error } = await draftsService.saveDraft({
				user_id: user.id,
				content: contentToSave,
				category: categoryToSave,
			})

			if (error) throw error

			toast({
				title: "Draft Saved",
				description: "Your post draft has been saved. You can complete it later.",
			})
			resetForm()
		} catch (err: any) {
			console.error("Failed to save draft:", err)
			toast({
				title: "Error",
				description: err?.message || "Failed to save draft.",
				variant: "destructive",
			})
		} finally {
			setIsSavingDraft(false)
		}
	}

	// Handle Submit (Create Post)
	const handleSubmit = async () => {
		if (!user || isLoading) return

		// Validation according to matrix
		if (postType === "express") {
			if (!expressContent.trim()) {
				toast({
					title: "Content Required",
					description: "Please share your thoughts before posting.",
					variant: "destructive",
				})
				return
			}
			if (expressContent.length > 600) {
				toast({
					title: "Limit Exceeded",
					description: "Content cannot exceed 600 characters.",
					variant: "destructive",
				})
				return
			}
		} else if (postType === "project") {
			if (!projectTitle.trim()) {
				toast({
					title: "Title Required",
					description: "Please enter a project title.",
					variant: "destructive",
				})
				return
			}
			if (!projectSubjectMatter.trim()) {
				toast({
					title: "Subject Matter Required",
					description: "Please enter the subject matter of the project.",
					variant: "destructive",
				})
				return
			}
			if (projectSubjectMatter.length > 100) {
				toast({
					title: "Limit Exceeded",
					description: "Subject matter cannot exceed 100 characters.",
					variant: "destructive",
				})
				return
			}
		} else if (postType === "opportunity") {
			if (!opportunityTitle.trim()) {
				toast({
					title: "Title Required",
					description: "Please enter the opportunity title.",
					variant: "destructive",
				})
				return
			}
			if (!opportunityLocation.trim()) {
				toast({
					title: "Location Required",
					description: "Please enter the opportunity location.",
					variant: "destructive",
				})
				return
			}
			if (!opportunityDescription.trim()) {
				toast({
					title: "Description Required",
					description: "Please describe the opportunity.",
					variant: "destructive",
				})
				return
			}
			if (opportunityDescription.length > 600) {
				toast({
					title: "Limit Exceeded",
					description: "Description cannot exceed 600 characters.",
					variant: "destructive",
				})
				return
			}
		}

		setIsLoading(true)

		try {
			let image_url: string | undefined
			let document_url: string | undefined
			let document_name: string | undefined

			const imageFiles = getPostImageFiles(mediaItems)

			const pdfItem = mediaItems.find((m) => m.type === "pdf" && m.file)

			// ── Multi-Image Upload ──────────────────────────────────────
			if (imageFiles.length > 0) {
				const { urls, errors } = await uploadPostImages(imageFiles, user.id)

				if (errors.length > 0 && urls.length === 0) {
					toast({
						title: "Image Upload Failed",
						description: errors[0] ?? "Could not upload image(s).",
						variant: "destructive",
					})
					return
				}

				if (urls.length === 1) {
					image_url = urls[0]
				} else if (urls.length > 1) {
					image_url = JSON.stringify(urls)
				}
			}

			// ── Document Upload (Express & Project only; no PDF on Opportunity) ─
			if (pdfItem?.file && postType !== "opportunity") {
				const { url, error: uploadError } = await uploadPostDocument(pdfItem.file, user.id)

				if (uploadError || !url) {
					toast({
						title: "Document Upload Failed",
						description: uploadError ?? "Could not upload document.",
						variant: "destructive",
					})
					return
				}

				document_url = url
				document_name = pdfItem.name || pdfItem.file.name
			}

			// Format post content according to post type
			let finalContent = ""
			let finalCategory: PostCategory = "industry"

			if (postType === "express") {
				finalContent = expressContent.trim()
				finalCategory = "industry"
			} else if (postType === "project") {
				finalCategory = "project"
				finalContent = `### ${projectTitle.trim()}\n${
					projectTimeline.trim() ? `Timeline: ${projectTimeline.trim()}\n\n` : ""
				}${projectSubjectMatter.trim()}`
			} else if (postType === "opportunity") {
				finalCategory = "opportunity"
				finalContent = `### ${opportunityTitle.trim()}\n🏢 ${
					opportunityCompany.trim() || "Undisclosed"
				}\n📍 ${opportunityLocation.trim()}\n💼 Type: ${opportunityType} • 🎯 Experience: ${opportunityExperience}\n\n${opportunityDescription.trim()}`
			}

			const { error } = await postsService.createPost({
				content: finalContent,
				category: finalCategory,
				user_id: user.id,
				image_url,
				document_url,
				document_name,
			})

			if (error) {
				throw error
			}

			toast({
				title: "Success",
				description: "Your post has been created successfully!",
			})

			resetForm()
		} catch (error: any) {
			console.error("Error creating post:", error)
			toast({
				title: "Error",
				description: error?.message || "Failed to create post.",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	if (!user) {
		return (
			<Card className="border-0 shadow-sm">
				<CardContent className="p-6 text-center">
					<p className="text-gray-600">Please sign in to create posts</p>
				</CardContent>
			</Card>
		)
	}

	const isProject = postType === "project"
	const isOpportunity = postType === "opportunity"
	const isExpress = postType === "express"

	// Determine if submit is disabled based on current active composer
	const isSubmitDisabled =
		isLoading ||
		(isExpress && !expressContent.trim()) ||
		(isProject && (!projectTitle.trim() || !projectSubjectMatter.trim())) ||
		(isOpportunity &&
			(!opportunityTitle.trim() ||
				!opportunityLocation.trim() ||
				!opportunityDescription.trim()))

	return (
		<div className={cn("space-y-6 mt-4 mb-24", isMobile && "px-0")}>
			{/* "What would you like to share?" screen */}
			<PostTypeSelector postType={postType} setPostType={handlePostTypeChange} />

			{/* Main Composer Card */}
			<Card className={cn("border-0 shadow-sm max-h-[90vh] overflow-y-auto", isMobile && "rounded-none")}>
				<CardContent className={cn("space-y-4", isMobile ? "p-3" : "p-5")}>
					{/* Author Row */}
					<UserAvatarHeader user={user} />

					{/* ── 1. Express Yourself Composer ── */}
					{isExpress && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="express-content" className="text-xs text-muted-foreground">
									Share your thoughts
								</Label>
								<span
									className={cn(
										"text-xs font-mono",
										expressContent.length > 550 ? "text-amber-600 font-semibold" : "text-muted-foreground"
									)}
								>
									{expressContent.length} / 600 characters
								</span>
							</div>
							<Textarea
								id="express-content"
								placeholder="Share your thoughts, insights or updates with the community…"
								value={expressContent}
								maxLength={600}
								onChange={(e) => setExpressContent(e.target.value.slice(0, 600))}
								className="min-h-[140px] resize-none border text-sm"
							/>
						</div>
					)}

					{/* ── 2. Showcase Project Composer ── */}
					{isProject && (
						<div className="space-y-3">
							<div className="space-y-1">
								<Label htmlFor="project-title" className="text-xs font-medium">
									Title*
								</Label>
								<Input
									id="project-title"
									placeholder="Project Title*"
									value={projectTitle}
									onChange={(e) => setProjectTitle(e.target.value)}
									required
									className="text-sm"
								/>
							</div>

							<div className="space-y-1">
								<Label htmlFor="project-timeline" className="text-xs font-medium text-muted-foreground">
									Timeline (optional)
								</Label>
								<Input
									id="project-timeline"
									placeholder="e.g. Jan 2024 - Dec 2024 (or Ongoing)"
									value={projectTimeline}
									onChange={(e) => setProjectTimeline(e.target.value)}
									className="text-sm"
								/>
							</div>

							<div className="space-y-1">
								<div className="flex items-center justify-between">
									<Label htmlFor="project-subject" className="text-xs font-medium">
										Subject Matter*
									</Label>
									<span
										className={cn(
											"text-xs font-mono",
											projectSubjectMatter.length > 90
												? "text-amber-600 font-semibold"
												: "text-muted-foreground"
										)}
									>
										{projectSubjectMatter.length} / 100 characters
									</span>
								</div>
								<Textarea
									id="project-subject"
									placeholder="Display and highlight your latest or past work"
									value={projectSubjectMatter}
									maxLength={100}
									onChange={(e) => setProjectSubjectMatter(e.target.value.slice(0, 100))}
									className="min-h-[80px] resize-none border text-sm"
									required
								/>
							</div>
						</div>
					)}

					{/* ── 3. Post Opportunity Composer ── */}
					{isOpportunity && (
						<div className="space-y-3">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div className="space-y-1">
									<Label htmlFor="opportunity-title" className="text-xs font-medium">
										Title*
									</Label>
									<Input
										id="opportunity-title"
										placeholder="Title*"
										value={opportunityTitle}
										onChange={(e) => setOpportunityTitle(e.target.value)}
										required
										className="text-sm"
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="opportunity-company" className="text-xs font-medium">
										Company
									</Label>
									<Input
										id="opportunity-company"
										placeholder="Company"
										value={opportunityCompany}
										onChange={(e) => setOpportunityCompany(e.target.value)}
										className="text-sm"
									/>
								</div>
							</div>

							<div className="space-y-1">
								<Label htmlFor="opportunity-location" className="text-xs font-medium">
									Location*
								</Label>
								<Input
									id="opportunity-location"
									placeholder="Location*"
									value={opportunityLocation}
									onChange={(e) => setOpportunityLocation(e.target.value)}
									required
									className="text-sm"
								/>
							</div>

							<div className="space-y-1">
								<Label htmlFor="opportunity-type" className="text-xs font-medium">
									Type*
								</Label>
								<Select
									value={opportunityType}
									onValueChange={(value) => setOpportunityType(value as OpportunityType)}
								>
									<SelectTrigger id="opportunity-type">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{OPPORTUNITY_TYPES.map((typeOption) => (
											<SelectItem key={typeOption} value={typeOption}>
												{typeOption}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1">
								<Label htmlFor="opportunity-experience" className="text-xs font-medium">
									Experience*
								</Label>
								<Select
									value={opportunityExperience}
									onValueChange={(value) =>
										setOpportunityExperience(value as ExperienceLevel)
									}
								>
									<SelectTrigger id="opportunity-experience">
										<SelectValue placeholder="Select experience level" />
									</SelectTrigger>
									<SelectContent>
										{EXPERIENCE_LEVELS.map((levelOption) => (
											<SelectItem key={levelOption} value={levelOption}>
												{levelOption}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1">
								<div className="flex items-center justify-between">
									<Label htmlFor="opportunity-description" className="text-xs font-medium">
										Description*
									</Label>
									<span
										className={cn(
											"text-xs font-mono",
											opportunityDescription.length > 550
												? "text-amber-600 font-semibold"
												: "text-muted-foreground"
										)}
									>
										{opportunityDescription.length} / 600 characters
									</span>
								</div>
								<Textarea
									id="opportunity-description"
									placeholder="Advertise gigs, job openings & any other opportunities"
									value={opportunityDescription}
									maxLength={600}
									onChange={(e) => setOpportunityDescription(e.target.value.slice(0, 600))}
									className="min-h-[110px] resize-none border text-sm"
									required
								/>
							</div>
						</div>
					)}

					<MediaUploader
						mediaItems={mediaItems}
						onChange={setMediaItems}
						allowPdf={!isOpportunity}
						isProject={isProject}
						onOpenLayoutEditor={() => setLayoutEditorOpen(true)}
						disabled={isLoading}
					/>

					{/* Actions Bar — Consistent Cancel / Create / Create Later across composers */}
					<div
						className={cn(
							"flex flex-col md:flex-row md:justify-end items-center mt-6 gap-2.5 pt-4 border-t sticky bottom-0 bg-background",
							isMobile && "gap-2"
						)}
					>
						{/* Create Later action (Showcase Project and Post Opportunity per spec) */}
						{(isProject || isOpportunity) && (
							<Button
								type="button"
								variant="outline"
								disabled={isLoading || isSavingDraft}
								onClick={handleCreateLater}
								className={cn("text-xs font-medium", isMobile && "w-full py-2.5")}
							>
								{isSavingDraft ? "Saving Draft..." : "Create Later"}
							</Button>
						)}

						<Button
							type="button"
							variant="ghost"
							className={cn("text-muted-foreground hover:text-foreground text-xs", isMobile && "w-full py-2.5")}
							disabled={isLoading}
							onClick={handleCancel}
						>
							Cancel
						</Button>

						<Button
							type="button"
							className={cn(
								"bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-xs px-5",
								isMobile && "w-full py-2.5"
							)}
							disabled={isSubmitDisabled}
							onClick={handleSubmit}
						>
							{isLoading ? "Creating..." : "Create"}
						</Button>
					</div>
				</CardContent>
			</Card>

			{isProject && (
				<MediaLayoutEditor
					open={layoutEditorOpen}
					onOpenChange={setLayoutEditorOpen}
					items={mediaItems}
					onSave={(updated) => setMediaItems(updated)}
				/>
			)}
		</div>
	)
}

export default PostCreate
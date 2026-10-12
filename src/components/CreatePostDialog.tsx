import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { postsService } from "@/services/postsService"
import { useToast } from "@/hooks/use-toast"
import { uploadPostImages, uploadPostDocument } from "@/lib/uploadUtils"
import { MediaItem, MediaUploader, MediaLayoutEditor } from "@/components/media"

interface CreatePostDialogProps {
	onPostCreated?: () => void
}

export type PostStatus = "industry" | "project" | "opportunity"

interface FormData {
	content: string
	status: PostStatus
}

export const CreatePostDialog = ({ onPostCreated }: CreatePostDialogProps) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState<FormData>({
		content: "",
		status: "industry",
	})
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
	const [layoutEditorOpen, setLayoutEditorOpen] = useState(false)

	// Exact placeholder mapping required by spec:
	// Industry -> Display & highlight your work
	// Project -> Share your thoughts, insights or questions
	// Opportunity -> Post gigs, job openings & any other opportunities
	const placeholders: Record<PostStatus, string> = {
		industry: "Display & highlight your work",
		project: "Share your thoughts, insights or questions",
		opportunity: "Post gigs, job openings & any other opportunities",
	}

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

	const handleStatusChange = (value: PostStatus) => {
		// When switching to opportunity, remove any PDF attachments since opportunity does not permit PDFs
		if (value === "opportunity") {
			const withoutPdf = mediaItems.filter((item) => {
				if (item.type === "pdf") {
					if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
					return false
				}
				return true
			})
			setMediaItems(withoutPdf)
		}
		setFormData((prev) => ({ ...prev, status: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user || !formData.content.trim() || isLoading) return

		setIsLoading(true)
		try {
			let image_url: string | undefined
			let document_url: string | undefined
			let document_name: string | undefined

			const imageFiles = mediaItems
				.filter((m) => m.type === "image" && m.file)
				.map((m) => m.file as File)

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

			// ── Document Upload (only allowed for industry & project) ─────
			if (pdfItem?.file && formData.status !== "opportunity") {
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

			const { error } = await postsService.createPost({
				content: formData.content.trim(),
				category: formData.status,
				user_id: user.id,
				image_url,
				document_url,
				document_name,
			})

			if (error) throw error

			toast({
				title: "Success",
				description: "Your post has been created successfully!",
			})

			// Reset form
			mediaItems.forEach((item) => {
				if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
			})
			setFormData({ content: "", status: "industry" })
			setMediaItems([])
			setOpen(false)
			onPostCreated?.()
		} catch (error) {
			console.error("[CreatePostDialog] Unexpected error creating post:", error)
			toast({
				title: "Error",
				description: "Failed to create post. Please try again.",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	const isProject = formData.status === "project"
	const allowPdf = formData.status !== "opportunity"

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button className="w-full">
						<Plus className="mr-2 h-4 w-4" />
						Create Post
					</Button>
				</DialogTrigger>

				<DialogContent
					className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
					description="Create a new post with status, content, and media attachments"
				>
					<DialogHeader>
						<DialogTitle>Create New Post</DialogTitle>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Status selector (replaces Category per spec) */}
						<div className="space-y-2">
							<Label htmlFor="post-status">Status</Label>
							<Select value={formData.status} onValueChange={handleStatusChange}>
								<SelectTrigger id="post-status">
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="industry">Industry</SelectItem>
									<SelectItem value="project">Project</SelectItem>
									<SelectItem value="opportunity">Opportunity</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Content textarea with exact placeholders per spec */}
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="content">Content</Label>
								<span className="text-xs text-muted-foreground font-mono">
									{formData.content.length} / 600 characters
								</span>
							</div>
							<Textarea
								id="content"
								value={formData.content}
								maxLength={600}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										content: e.target.value.slice(0, 600),
									}))
								}
								placeholder={placeholders[formData.status]}
								rows={4}
								required
							/>
						</div>

						{/* Shared Media Uploader */}
						<MediaUploader
							mediaItems={mediaItems}
							onChange={setMediaItems}
							allowPdf={allowPdf}
							isProject={isProject}
							onOpenLayoutEditor={() => setLayoutEditorOpen(true)}
							disabled={isLoading}
						/>

						{/* Modal Actions */}
						<div className="flex justify-end space-x-2 pt-4 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isLoading || !formData.content.trim()}>
								{isLoading ? "Creating..." : "Create Post"}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Project-only Pop-up Layout Editor */}
			{isProject && (
				<MediaLayoutEditor
					open={layoutEditorOpen}
					onOpenChange={setLayoutEditorOpen}
					items={mediaItems}
					onSave={(updated) => setMediaItems(updated)}
				/>
			)}
		</>
	)
}

export default CreatePostDialog

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Camera, FileText, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { postsService } from "@/services/postsService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import MediaPreview from "@/components/ui/media-preview"

interface CreatePostDialogProps {
	onPostCreated?: () => void
}

type PostCategory = "general" | "project" | "career"



interface FormData {
	content: string
	category: PostCategory
}

const CreatePostDialog = ({ onPostCreated }: CreatePostDialogProps) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState<FormData>({
		content: "",
		category: "general",
	})
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [documentFile, setDocumentFile] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null)
	const imageInputRef = useRef<HTMLInputElement>(null)
	const documentInputRef = useRef<HTMLInputElement>(null)

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			// Validate MIME type
			if (!file.type.startsWith("image/")) {
				toast({
					title: "Invalid File Type",
					description: "Only image files are supported (JPEG, PNG, WebP, etc.).",
					variant: "destructive",
				})
				e.target.value = ""
				return
			}
			// Validate size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				toast({
					title: "File Too Large",
					description: "Images must be less than 10MB.",
					variant: "destructive",
				})
				e.target.value = ""
				return
			}
			// Revoke previous preview URL
			if (imagePreview) {
				URL.revokeObjectURL(imagePreview)
			}
			setImageFile(file)
			setImagePreview(URL.createObjectURL(file))
		}
	}

  const placeholders: Record<string, string> = {
		general: "Share your thoughts, insights or questions...",
		project: "Display & highlight your work...",
		career: "Post gigs, job openings & any other opportunities...",
  }
  
	const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			// Check if file is PDF
			const fileType = file.type
			const fileExtension = file.name.split(".").pop()?.toLowerCase()

			if (fileType !== "application/pdf" && fileExtension !== "pdf") {
				toast({
					title: "Invalid File Type",
					description: "Only PDF documents are supported for upload.",
					variant: "destructive",
				})
				e.target.value = ""
				return
			}

			// Validate size (max 20MB)
			if (file.size > 20 * 1024 * 1024) {
				toast({
					title: "File Too Large",
					description: "PDF documents must be less than 20MB.",
					variant: "destructive",
				})
				e.target.value = ""
				return
			}

			// Revoke previous preview URL
			if (documentPreviewUrl) {
				URL.revokeObjectURL(documentPreviewUrl)
			}

			setDocumentFile(file)
			setDocumentPreviewUrl(URL.createObjectURL(file))
		}
	}

	const handleRemoveImage = () => {
		setImageFile(null)
		setImagePreview(null)
		if (imageInputRef.current) imageInputRef.current.value = ""
	}

	const handleRemoveDocument = () => {
		setDocumentFile(null)
		setDocumentPreviewUrl(null)
		if (documentInputRef.current) documentInputRef.current.value = ""
	}

	// Cleanup object URLs on unmount and dialog close
	useEffect(() => {
		if (!open) {
			// Cleanup on close
			if (imagePreview) URL.revokeObjectURL(imagePreview)
			if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)
			setImageFile(null)
			setImagePreview(null)
			setDocumentFile(null)
			setDocumentPreviewUrl(null)
			setFormData({ content: "", category: "general" })
		}
	}, [open])

	useEffect(() => {
		return () => {
			if (imagePreview) URL.revokeObjectURL(imagePreview)
			if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)
		}
	}, [imagePreview, documentPreviewUrl])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user || !formData.content.trim()) return

		setIsLoading(true)
		try {
			let image_url: string | undefined

			// Handle image upload
			if (imageFile) {
				const fileExt = imageFile.name.split(".").pop()
				const filePath = `user-${user.id}/${Date.now()}.${fileExt}`
				const { data: uploadData, error: uploadError } = await supabase.storage.from("post-media").upload(filePath, imageFile)

				if (uploadError) {
					throw uploadError
				}

				const { data: publicUrlData } = supabase.storage.from("post-media").getPublicUrl(filePath)
				image_url = publicUrlData?.publicUrl
			}

			let document_url: string | undefined

			// Handle document upload
			if (documentFile) {
				// Create unique filename
				const timestamp = Date.now()
				const originalFileName = documentFile.name
				const fileExtension = originalFileName.split(".").pop()
				const uniqueFileName = `doc-${timestamp}.${fileExtension}`
				const filePath = `user-${user.id}/${uniqueFileName}`

				const { data: uploadData, error: uploadError } = await supabase.storage.from("post-media").upload(filePath, documentFile)

				if (uploadError) {
					console.error("Document upload error:", uploadError)
					throw uploadError
				}

				const { data: publicUrlData } = supabase.storage.from("post-media").getPublicUrl(filePath)
				document_url = publicUrlData?.publicUrl
			}

			const { error } = await postsService.createPost({
				content: formData.content,
				category: formData.category,
				user_id: user.id,
				image_url,
				document_url,
				document_name: documentFile?.name,
			})

			if (error) throw error

			toast({
				title: "Post created!",
				description: "Your post has been published successfully.",
			})

			// Cleanup object URLs
			if (imagePreview) URL.revokeObjectURL(imagePreview)
			if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)

			setFormData({ content: "", category: "general" })
			setImageFile(null)
			setDocumentFile(null)
			setImagePreview(null)
			setDocumentPreviewUrl(null)
			setOpen(false)
			onPostCreated?.()
		} catch (error) {
			const message =
				error && typeof error === "object" && "message" in error
					? String((error as { message: unknown }).message)
					: "Failed to create post. Please try again."
			toast({
				title: "Error",
				description: message,
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	const handleCategoryChange = (value: PostCategory) => {
		setFormData((prev) => ({ ...prev, category: value }))
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-full">
					<Plus className="mr-2 h-4 w-4" />
					Create Post
				</Button>
			</DialogTrigger>

			<DialogContent
				className="sm:max-w-[600px]"
				description="Create a new post with optional image or PDF attachment">
				<DialogHeader>
					<DialogTitle>Create New Post</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="category">Status</Label>
						<Select
							value={formData.category}
							onValueChange={handleCategoryChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="general">General</SelectItem>
								<SelectItem value="project">Project</SelectItem>
								<SelectItem value="career">Career</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="content">Content</Label>
						<Textarea
							id="content"
							value={formData.content}
							onChange={(e) => handleInputChange("content", e.target.value)}
							placeholder={placeholders[formData.category] || "Share your thoughts..."}
							rows={4}
							required
						/>
					</div>

					{/* Image Preview */}
					{imagePreview && (
						<div className="relative w-full max-w-xs">
							<img
								src={imagePreview}
								className="h-40 w-full rounded-md border object-cover"
								alt="Preview"
							/>
							<button
								type="button"
								className="absolute right-1 top-1 rounded-full bg-white p-1 shadow hover:bg-gray-100"
								onClick={handleRemoveImage}>
								<X className="h-4 w-4 text-gray-600" />
							</button>
						</div>
					)}

					{/* Document Preview with Remove Button */}
					{documentFile && (
						<div className="relative border-t pt-4">
							<h4 className="mb-2 text-sm font-medium">PDF Document Preview</h4>
							<div className="relative">
								<MediaPreview
									url={documentPreviewUrl || ""}
									type="pdf"
									name={documentFile.name}
									size="lg"
									showActions={false}
								/>
								<button
									type="button"
									className="absolute right-2 top-2 rounded-full bg-white p-1 shadow hover:bg-gray-100"
									onClick={handleRemoveDocument}>
									<X className="h-4 w-4 text-gray-600" />
								</button>
							</div>
						</div>
					)}

					{/* File Upload Options */}
					<div className="flex items-center space-x-4 border-t pt-4">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-gray-600"
							onClick={() => imageInputRef.current?.click()}>
							<Camera className="mr-2 h-4 w-4" />
							Add Image
							<input
								ref={imageInputRef}
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleImageChange}
							/>
						</Button>

						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-gray-600"
							onClick={() => documentInputRef.current?.click()}>
							<FileText className="mr-2 h-4 w-4" />
							Add PDF
							<input
								ref={documentInputRef}
								type="file"
								accept=".pdf"
								className="hidden"
								onChange={handleDocumentChange}
							/>
						</Button>
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}>
							{isLoading ? "Creating..." : "Create Post"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default CreatePostDialog

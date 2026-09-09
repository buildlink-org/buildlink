import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Camera, FileText, X, ArrowLeft, ArrowRight, Star } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { postsService } from "@/services/postsService"
import { useToast } from "@/hooks/use-toast"
import MediaPreview from "@/components/ui/media-preview"
import { uploadPostImages, uploadPostDocument, validateUploadFile, ALLOWED_MIME, MAX_SIZE } from "@/lib/uploadUtils"

interface CreatePostDialogProps {
	onPostCreated?: () => void
}

type PostCategory = "project" | "industry" | "opportunity"

interface FormData {
	content: string
	category: PostCategory
}

interface ImageItem {
	id: string
	file: File
	previewUrl: string
}

const CreatePostDialog = ({ onPostCreated }: CreatePostDialogProps) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [formData, setFormData] = useState<FormData>({
		content: "",
		category: "project",
	})
	const [imageItems, setImageItems] = useState<ImageItem[]>([])
	const [documentFile, setDocumentFile] = useState<File | null>(null)
	const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null)
	const imageInputRef = useRef<HTMLInputElement>(null)
	const documentInputRef = useRef<HTMLInputElement>(null)

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || [])
		if (files.length === 0) return

		if (imageItems.length + files.length > 10) {
			toast({
				title: "Limit Exceeded",
				description: "You can attach up to 10 images per post.",
				variant: "destructive",
			})
			return
		}

		const newItems: ImageItem[] = []
		files.forEach((file) => {
			const { valid, error } = validateUploadFile(file, ALLOWED_MIME.image, MAX_SIZE.postImage)
			if (!valid && error) {
				toast({
					title: "Invalid File",
					description: error,
					variant: "destructive",
				})
				return
			}
			newItems.push({
				id: `${Date.now()}-${Math.random()}`,
				file,
				previewUrl: URL.createObjectURL(file),
			})
		})

		if (newItems.length > 0) {
			setImageItems((prev) => [...prev, ...newItems])
		}

		if (imageInputRef.current) imageInputRef.current.value = ""
	}

	const handleRemoveImage = (id: string) => {
		setImageItems((prev) => {
			const itemToRemove = prev.find((item) => item.id === id)
			if (itemToRemove) {
				URL.revokeObjectURL(itemToRemove.previewUrl)
			}
			return prev.filter((item) => item.id !== id)
		})
	}

	const moveImage = (index: number, direction: "left" | "right") => {
		setImageItems((prev) => {
			const newArr = [...prev]
			const targetIndex = direction === "left" ? index - 1 : index + 1
			if (targetIndex < 0 || targetIndex >= newArr.length) return prev
			const temp = newArr[index]
			newArr[index] = newArr[targetIndex]
			newArr[targetIndex] = temp
			return newArr
		})
	}

	const makeCoverImage = (index: number) => {
		if (index === 0) return
		setImageItems((prev) => {
			const newArr = [...prev]
			const [selected] = newArr.splice(index, 1)
			newArr.unshift(selected)
			return newArr
		})
	}

	const placeholders: Record<string, string> = {
		project: "Display & highlight your work...",
		industry: "Share your thoughts, insights or questions...",
		opportunity: "Post gigs, job openings & any other opportunities...",
	}

	const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const { valid, error } = validateUploadFile(file, ALLOWED_MIME.pdf, MAX_SIZE.document)
			if (!valid && error) {
				toast({
					title: "Invalid Document",
					description: error,
					variant: "destructive",
				})
				e.target.value = ""
				return
			}

			if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)
			setDocumentFile(file)
			setDocumentPreviewUrl(URL.createObjectURL(file))
		}
	}

	const handleRemoveDocument = () => {
		if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)
		setDocumentFile(null)
		setDocumentPreviewUrl(null)
		if (documentInputRef.current) documentInputRef.current.value = ""
	}

	useEffect(() => {
		return () => {
			imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
			if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)
		}
	}, [imageItems, documentPreviewUrl])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user || !formData.content.trim()) return

		setIsLoading(true)
		try {
			let image_url: string | undefined

			// ── Multi-Image Upload ──────────────────────────────────────
			if (imageItems.length > 0) {
				const filesToUpload = imageItems.map((item) => item.file)
				const { urls, errors } = await uploadPostImages(filesToUpload, user.id)

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

			let document_url: string | undefined

			// ── Document Upload ──────────────────────────────────────────
			if (documentFile) {
				const { url, error: uploadError } = await uploadPostDocument(documentFile, user.id)
				if (uploadError || !url) {
					toast({
						title: "Document Upload Failed",
						description: uploadError ?? "Could not upload document.",
						variant: "destructive",
					})
					return
				}
				document_url = url
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
				title: "Success",
				description: "Your post has been created successfully!",
			})

			// Reset form
			imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
			if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)
			setFormData({ content: "", category: "project" })
			setImageItems([])
			setDocumentFile(null)
			setDocumentPreviewUrl(null)
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

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	const handleCategoryChange = (value: PostCategory) => {
		setFormData((prev) => ({ ...prev, category: value }))
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="w-full">
					<Plus className="mr-2 h-4 w-4" />
					Create Post
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" description="Create a new post with images or PDF attachment">
				<DialogHeader>
					<DialogTitle>Create New Post</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="category">Status</Label>
						<Select value={formData.category} onValueChange={handleCategoryChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="project">Project</SelectItem>
								<SelectItem value="industry">Industry</SelectItem>
								<SelectItem value="opportunity">Opportunity</SelectItem>
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

					{/* Image Previews & Arrangement */}
					{imageItems.length > 0 && (
						<div className="space-y-2 border-t pt-4">
							<div className="flex items-center justify-between">
								<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Images ({imageItems.length}/10)
								</Label>
								<span className="text-xs text-muted-foreground">First image is cover thumbnail</span>
							</div>

							<div className="grid grid-cols-3 gap-2">
								{imageItems.map((item, idx) => (
									<div key={item.id} className={`group relative h-28 rounded-lg border overflow-hidden ${idx === 0 ? "ring-2 ring-primary" : ""}`}>
										<img src={item.previewUrl} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />

										{/* Cover Badge */}
										{idx === 0 && (
											<span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
												Cover
											</span>
										)}

										{/* Overlay Controls */}
										<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
											<div className="flex items-center justify-between">
												{idx > 0 && (
													<button
														type="button"
														onClick={() => makeCoverImage(idx)}
														className="bg-white/90 hover:bg-white text-yellow-600 p-1 rounded-full text-xs flex items-center gap-1"
														title="Set as Cover"
													>
														<Star className="h-3 w-3 fill-yellow-500" />
													</button>
												)}
												<button
													type="button"
													onClick={() => handleRemoveImage(item.id)}
													className="ml-auto bg-white/90 hover:bg-white text-destructive p-1 rounded-full"
													title="Remove image"
												>
													<X className="h-3.5 w-3.5" />
												</button>
											</div>

											<div className="flex items-center justify-between">
												<button
													type="button"
													disabled={idx === 0}
													onClick={() => moveImage(idx, "left")}
													className="bg-white/90 hover:bg-white disabled:opacity-30 p-1 rounded-full text-gray-700"
													title="Move left"
												>
													<ArrowLeft className="h-3.5 w-3.5" />
												</button>
												<button
													type="button"
													disabled={idx === imageItems.length - 1}
													onClick={() => moveImage(idx, "right")}
													className="bg-white/90 hover:bg-white disabled:opacity-30 p-1 rounded-full text-gray-700"
													title="Move right"
												>
													<ArrowRight className="h-3.5 w-3.5" />
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Document Preview */}
					{documentFile && (
						<div className="relative border-t pt-4">
							<h4 className="mb-2 text-sm font-medium">PDF Document Preview</h4>
							<div className="relative">
								<MediaPreview url={documentPreviewUrl || ""} type="pdf" name={documentFile.name} size="lg" showActions={false} />
								<button
									type="button"
									className="absolute right-2 top-2 rounded-full bg-white p-1 shadow hover:bg-gray-100"
									onClick={handleRemoveDocument}
								>
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
							disabled={imageItems.length >= 10}
							onClick={() => imageInputRef.current?.click()}
						>
							<Camera className="mr-2 h-4 w-4" />
							{imageItems.length > 0 ? "Add More Photos" : "Add Images"}
							<input
								ref={imageInputRef}
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={handleImageChange}
							/>
						</Button>

						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="text-gray-600"
							disabled={Boolean(documentFile)}
							onClick={() => documentInputRef.current?.click()}
						>
							<FileText className="mr-2 h-4 w-4" />
							Add PDF
							<input ref={documentInputRef} type="file" accept=".pdf" className="hidden" onChange={handleDocumentChange} />
						</Button>
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button type="button" variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Creating..." : "Create Post"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default CreatePostDialog

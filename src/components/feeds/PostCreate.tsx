import { cn } from "@/lib/utils"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Camera, FileText, MapPin, X } from "lucide-react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import PostTypeSelector from "./PostTypeSelector"
import UserAvatarHeader from "./UserAvatarHeader"
import { useAuth } from "@/contexts/AuthContext"
import { postsService } from "@/services/postsService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import MediaPreview from "@/components/ui/media-preview"
import { postContentSchema } from "@/lib/validationSchemas"
import { z } from "zod"

// Add support for uploading a single image per post for MVP

const PostCreate = () => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [postType, setPostType] = useState("update")
	const [content, setContent] = useState("")
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [documentFile, setDocumentFile] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const documentInputRef = useRef<HTMLInputElement>(null)
	const isMobile = useIsMobile()

	// Memorize handlers to avoid unnecessary re-renders.
	const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setImageFile(file)
			setImagePreview(URL.createObjectURL(file))
		}
	}, [])

	const handleRemoveImage = useCallback(() => {
		setImageFile(null)
		setImagePreview(null)
		if (fileInputRef.current) fileInputRef.current.value = ""
	}, [])

	const handleDocumentChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
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
					e.target.value = "" // Clear the input
					return
				}
				if (fileType !== "application/pdf" && fileExtension !== "pdf") {
					toast({
						title: "Invalid File Type",
						description: "Only PDF documents are supported for upload.",
						variant: "destructive",
					})
					e.target.value = "" // Clear the input
					return
				}

				setDocumentFile(file)
				setDocumentPreviewUrl(URL.createObjectURL(file))
			}
		},
		[toast],
	)

	useEffect(() => {
		return () => {
			if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)
		}
	}, [documentPreviewUrl])

	const cancelCreatePost = (e) => {
		e.preventDefault()

		setImageFile(null)
		setDocumentFile(null)
		setDocumentPreviewUrl(null)
		setContent("")
	}

	const handleSubmit = useCallback(async () => {
		if (!user) return

		setIsLoading(true)
		setIsLoading(true)
		try {
			// Validate input
			const validatedData = postContentSchema.parse({
				content,
				category: postType,
			})
			let image_url: string | undefined
			let document_url: string | undefined

			if (imageFile) {
				// upload image to Supabase Storage
				const fileExt = imageFile.name.split(".").pop()
				const filePath = `user-${user.id}/${Date.now()}.${fileExt}`
				const { data: uploadData, error: uploadError } = await supabase.storage.from("post-media").upload(filePath, imageFile, { upsert: false })

				if (uploadError) {
					console.error("Upload error:", uploadError)
					toast({
						title: "Upload Failed",
						description: "Could not upload image. Please try again.",
						variant: "destructive",
					})
					setIsLoading(false)
					return
				}

				const { data: publicUrlData } = supabase.storage.from("post-media").getPublicUrl(filePath)
				if (!publicUrlData?.publicUrl) {
					toast({
						title: "Image URL Error",
						description: "Could not get image URL. Please try again.",
						variant: "destructive",
					})
					setIsLoading(false)
					return
				}
				image_url = publicUrlData.publicUrl
			}

			if (documentFile) {
				// upload document to Supabase Storage
				const filePath = `user-${user.id}/${Date.now()}_${documentFile.name}`
				const { data: uploadData, error: uploadError } = await supabase.storage.from("post-media").upload(filePath, documentFile, { upsert: false })

				if (uploadError) {
					console.error("Document upload error:", uploadError)
					toast({
						title: "Upload Failed",
						description: "Could not upload document. Please try again.",
						variant: "destructive",
					})
					setIsLoading(false)
					return
				}

				const { data: publicUrlData } = supabase.storage.from("post-media").getPublicUrl(filePath)
				if (!publicUrlData?.publicUrl) {
					toast({
						title: "Document URL Error",
						description: "Could not get document URL. Please try again.",
						variant: "destructive",
					})
					setIsLoading(false)
					return
				}
				document_url = publicUrlData.publicUrl
			}

			const { error } = await postsService.createPost({
				content: validatedData.content,
				category: validatedData.category,
				user_id: user.id,
				image_url,
				document_url,
				document_name: documentFile?.name,
			})

			if (error) {
				throw error
			}

			toast({
				title: "Success",
				description: "Your post has been created successfully!",
			})

			setContent("")
			setPostType("update")
			setImageFile(null)
			setDocumentFile(null)
			setImagePreview(null)
			setDocumentPreviewUrl(null)
			if (fileInputRef.current) fileInputRef.current.value = ""
			if (documentInputRef.current) documentInputRef.current.value = ""
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast({
					title: "Validation Error",
					description: error.errors[0].message,
					variant: "destructive",
				})
			} else {
				toast({
					title: "Error",
					description: "Failed to create post. Please try again.",
					variant: "destructive",
				})
			}
		} finally {
			setIsLoading(false)
		}
	}, [user, content, imageFile, documentFile, postType, toast])

	if (!user) {
		return (
			<Card className="border-0 shadow-sm">
				<CardContent className="p-6 text-center">
					<p className="text-gray-600">Please sign in to create posts</p>
				</CardContent>
			</Card>
		)
	}

	// Adjust paddings and spacings for mobile
	return (
		<div className={cn("space-y-6", isMobile ? "px-0" : "", "mt-4 mb-24")}>
			{/* Post Type Selection */}
			<PostTypeSelector
				postType={postType}
				setPostType={setPostType}
			/>

			{/* Content Creation */}
			<Card className={cn("border-0 shadow-sm", isMobile ? "rounded-none" : "")}>
				<CardContent className={cn(isMobile ? "p-2" : "p-4")}>
					<UserAvatarHeader user={user} />

					<Textarea
						placeholder={postType === "job" ? "Describe the job opportunity, requirements, and how to apply..." : postType === "project" ? "Tell us about your project - what you built, challenges faced, and key learnings..." : postType === "collaboration" ? "Describe what kind of collaboration you're seeking and what you bring to the table..." : "Share your thoughts, insights, or updates with the community..."}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className={cn("min-h-[120px] resize-none border-0 text-base p-0 w-full", isMobile ? "text-sm" : "")}
					/>
					{/* Image Preview */}
					{imagePreview && (
						<div className={cn("relative my-4 w-full max-w-xs", isMobile && "mx-auto")}>
							<img
								src={imagePreview}
								className="h-40 w-full rounded-md border object-cover"
								alt="Preview"
							/>
							<button
								type="button"
								aria-label="Remove image"
								className="absolute right-1 top-1 rounded-full bg-white p-1 shadow hover:bg-gray-100"
								onClick={handleRemoveImage}>
								<X className="h-5 w-5 text-gray-600" />
							</button>
						</div>
					)}

					{/* PDF Preview */}
					{documentFile && (
						<div className="my-4">
							<MediaPreview
								url={documentPreviewUrl || ""}
								type="pdf"
								name={documentFile.name}
								size="md"
								showActions
							/>
						</div>
					)}

					{/* Media Upload Options */}
					<div className={cn("flex items-center space-x-4 mt-4 pt-4 border-t", isMobile && "flex-wrap space-x-2")}>
						<Button
							variant="ghost"
							size={isMobile ? "sm" : "sm"}
							className={cn("text-muted-foreground hover:text-foreground", isMobile && "px-2 py-1")}
							asChild
							onClick={() => {
								if (fileInputRef.current) fileInputRef.current.click()
							}}>
							<span>
								<Camera className="mr-2 h-4 w-4" />
								<span className={isMobile ? "sr-only" : ""}>Add Photos</span>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleImageChange}
								/>
							</span>
						</Button>
						<Button
							variant="ghost"
							size={isMobile ? "sm" : "sm"}
							className={cn("text-muted-foreground hover:text-foreground", isMobile && "px-2 py-1")}
							onClick={() => documentInputRef.current?.click()}>
							<FileText className="mr-2 h-4 w-4" />
							<span className={isMobile ? "sr-only" : ""}>Add PDF</span>
							<input
								ref={documentInputRef}
								type="file"
								accept=".pdf"
								className="hidden"
								onChange={handleDocumentChange}
							/>
						</Button>
						<Button
							variant="ghost"
							size={isMobile ? "sm" : "sm"}
							className="text-muted-foreground hover:text-foreground"
							disabled>
							<MapPin className="mr-2 h-4 w-4" />
							<span className={isMobile ? "sr-only" : ""}>Add Location (soon)</span>
						</Button>
					</div>

					<div className={cn("flex-1 md:flex justify-end mt-4 gap-4", isMobile && "mt-2")}>
						<Button
							className={cn("border-primary text-primary hover:bg-primary-800 dark:border-white/50 dark:text-white/70 dark:hover:bg-white/10 dark:disabled:border-white/20 dark:disabled:text-white/40 dark:disabled:opacity-100", isMobile && "w-full py-3 text-base")}
							variant="outline"
							disabled={!content.trim() || isLoading}
							onClick={handleSubmit}>
							{isLoading ? "Saving..." : "Create Later"}
						</Button>
						<Button
							variant="link"
							className={cn("text-muted-foreground hover:text-foreground dark:text-white/70 dark:hover:text-white dark:disabled:text-white/40 dark:disabled:opacity-100", isMobile && "w-full py-3 text-base")}
							disabled={!content.trim() || isLoading}
							onClick={cancelCreatePost}>
							{isLoading ? "Canceling..." : "Cancel"}
						</Button>
						<Button
							className={cn("bg-primary text-primary-foreground hover:bg-primary-800 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:disabled:bg-white/5 dark:disabled:text-white/40 dark:disabled:opacity-100 font-medium", isMobile && "w-full py-3 text-base")}
							disabled={!content.trim() || isLoading}
							onClick={handleSubmit}>
							{isLoading ? "Posting..." : "Share Update"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default PostCreate

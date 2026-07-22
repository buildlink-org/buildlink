import { cn } from "@/lib/utils"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Camera, FileText, MapPin, X } from "lucide-react"
import {
	useState,
	useRef,
	useCallback,
	useEffect,
} from "react"

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

const PostCreate = () => {

	const { user } = useAuth()

	const { toast } = useToast()

	const isMobile = useIsMobile()

	const [postType, setPostType] =
		useState("general")

	const [content, setContent] =
		useState("")

	const [imageFile, setImageFile] =
		useState<File | null>(null)

	const [documentFile, setDocumentFile] =
		useState<File | null>(null)

	const [imagePreview, setImagePreview] =
		useState<string | null>(null)

	const [documentPreviewUrl,
		setDocumentPreviewUrl] =
		useState<string | null>(null)

	const [isLoading, setIsLoading] =
		useState(false)

	const fileInputRef =
		useRef<HTMLInputElement>(null)

	const documentInputRef =
		useRef<HTMLInputElement>(null)

	// =====================================
	// IMAGE CHANGE
	// =====================================
	const handleImageChange = useCallback(

		(e: React.ChangeEvent<HTMLInputElement>) => {

			const file = e.target.files?.[0]

			if (!file) return

			// cleanup old preview
			if (imagePreview) {
				URL.revokeObjectURL(imagePreview)
			}

			setImageFile(file)

			const previewUrl =
				URL.createObjectURL(file)

			setImagePreview(previewUrl)
		},

		[imagePreview]
	)

	// =====================================
	// REMOVE IMAGE
	// =====================================
	const handleRemoveImage = useCallback(() => {

		if (imagePreview) {
			URL.revokeObjectURL(imagePreview)
		}

		setImageFile(null)

		setImagePreview(null)

		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}

	}, [imagePreview])

	// =====================================
	// DOCUMENT CHANGE
	// =====================================
	const handleDocumentChange = useCallback(

		(e: React.ChangeEvent<HTMLInputElement>) => {

			const file = e.target.files?.[0]

			if (!file) return

			const fileType = file.type

			const fileExtension =
				file.name
					.split(".")
					.pop()
					?.toLowerCase()

			const isPdf =
				fileType === "application/pdf" ||
				fileExtension === "pdf"

			if (!isPdf) {

				toast({
					title: "Invalid File Type",
					description:
						"Only PDF documents are supported.",
					variant: "destructive",
				})

				e.target.value = ""

				return
			}

			// cleanup old preview
			if (documentPreviewUrl) {
				URL.revokeObjectURL(
					documentPreviewUrl
				)
			}

			setDocumentFile(file)

			const previewUrl =
				URL.createObjectURL(file)

			setDocumentPreviewUrl(previewUrl)
		},

		[toast, documentPreviewUrl]
	)

	// =====================================
	// CLEANUP MEMORY
	// =====================================
	useEffect(() => {

		return () => {

			if (imagePreview) {
				URL.revokeObjectURL(
					imagePreview
				)
			}

			if (documentPreviewUrl) {
				URL.revokeObjectURL(
					documentPreviewUrl
				)
			}
		}

	}, [imagePreview, documentPreviewUrl])

	// =====================================
	// CANCEL POST
	// =====================================
	const cancelCreatePost = (
		e: React.MouseEvent<HTMLButtonElement>
	) => {

		e.preventDefault()

		if (imagePreview) {
			URL.revokeObjectURL(imagePreview)
		}

		if (documentPreviewUrl) {
			URL.revokeObjectURL(
				documentPreviewUrl
			)
		}

		setContent("")

		setImageFile(null)

		setDocumentFile(null)

		setImagePreview(null)

		setDocumentPreviewUrl(null)

		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}

		if (documentInputRef.current) {
			documentInputRef.current.value = ""
		}
	}

	// =====================================
	// SUBMIT POST
	// =====================================
	const handleSubmit = useCallback(async () => {

		if (!user || isLoading) return

		setIsLoading(true)

		try {

			// VALIDATE
			const validatedData =
				postContentSchema.parse({

					content,

					category: postType,
				})

			let image_url:
				| string
				| undefined

			let document_url:
				| string
				| undefined

			// =====================================
			// IMAGE UPLOAD
			// =====================================
			if (imageFile) {

				const fileExt =
					imageFile.name
						.split(".")
						.pop()

				const filePath =
					`user-${user.id}/${Date.now()}.${fileExt}`

				const {
					error: uploadError,
				} = await supabase.storage
					.from("post-media")
					.upload(
						filePath,
						imageFile,
						{
							upsert: false,
						}
					)

				if (uploadError) {

					console.error(
						"Upload error:",
						uploadError
					)

					toast({
						title:
							"Upload Failed",
						description:
							"Could not upload image.",
						variant:
							"destructive",
					})

					return
				}

				const {
					data: publicUrlData,
				} = supabase.storage
					.from("post-media")
					.getPublicUrl(filePath)

				image_url =
					publicUrlData.publicUrl
			}

			// =====================================
			// DOCUMENT UPLOAD
			// =====================================
			if (documentFile) {

				const filePath =
					`user-${user.id}/${Date.now()}_${documentFile.name}`

				const {
					error: uploadError,
				} = await supabase.storage
					.from("post-media")
					.upload(
						filePath,
						documentFile,
						{
							upsert: false,
						}
					)

				if (uploadError) {

					console.error(
						"Document upload error:",
						uploadError
					)

					toast({
						title:
							"Upload Failed",
						description:
							"Could not upload document.",
						variant:
							"destructive",
					})

					return
				}

				const {
					data: publicUrlData,
				} = supabase.storage
					.from("post-media")
					.getPublicUrl(filePath)

				document_url =
					publicUrlData.publicUrl
			}

			// =====================================
			// CREATE POST
			// =====================================
			const { error } =
				await postsService.createPost({

					content:
						validatedData.content,

					category:
						validatedData.category,

					user_id: user.id,

					image_url,

					document_url,

					document_name:
						documentFile?.name,
				})

			if (error) {
				throw error
			}

			toast({
				title: "Success",
				description:
					"Your post has been created successfully!",
			})

			// RESET FORM
			setContent("")

			setPostType("general")

			setImageFile(null)

			setDocumentFile(null)

			setImagePreview(null)

			setDocumentPreviewUrl(null)

		} catch (error) {

			if (error instanceof z.ZodError) {

				toast({
					title:
						"Validation Error",

					description:
						error.errors[0].message,

					variant:
						"destructive",
				})

			} else {

				console.error(error)

				toast({
					title: "Error",

					description:
						"Failed to create post.",

					variant:
						"destructive",
				})
			}

		} finally {

			setIsLoading(false)

			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}

			if (documentInputRef.current) {
				documentInputRef.current.value = ""
			}
		}

	}, [
		user,
		isLoading,
		content,
		postType,
		imageFile,
		documentFile,
		toast,
	])

	// =====================================
	// NOT LOGGED IN
	// =====================================
	if (!user) {

		return (
			<Card className="border-0 shadow-sm">

				<CardContent className="p-6 text-center">

					<p className="text-gray-600">
						Please sign in to create posts
					</p>

				</CardContent>
			</Card>
		)
	}

	return (

		<div
			className={cn(
				"space-y-6 mt-4 mb-24",
				isMobile && "px-0"
			)}
		>

			{/* POST TYPE */}
			<PostTypeSelector
				postType={postType}
				setPostType={setPostType}
			/>

			{/* CREATE CARD */}
			<Card
				className={cn(
					"border-0 shadow-sm max-h-[90vh] overflow-y-auto",
					isMobile &&
						"rounded-none"
				)}
			>

				<CardContent
					className={cn(
						isMobile
							? "p-2"
							: "p-4"
					)}
				>

					<UserAvatarHeader
						user={user}
					/>

					{/* TEXTAREA */}
					<Textarea
						placeholder={
							postType === "career"
								? "Describe the job opportunity..."
								: postType === "project"
								? "Tell us about your project..."
								: postType === "collaboration"
								? "Describe your collaboration..."
								: "Share your thoughts..."
						}
						value={content}
						onChange={(e) =>
							setContent(
								e.target.value
							)
						}
						className={cn(
							"min-h-[120px] resize-none border-0 text-base p-0 w-full",
							isMobile &&
								"text-sm"
						)}
					/>

					{/* IMAGE PREVIEW */}
					{imagePreview && (

						<div
							className={cn(
								"relative my-4 w-full max-w-xs",
								isMobile &&
									"mx-auto"
							)}
						>

							<img
								src={imagePreview}
								className="h-40 w-full rounded-md border object-cover"
								alt="Preview"
							/>

							<button
								type="button"
								aria-label="Remove image"
								className="absolute right-1 top-1 rounded-full bg-white p-1 shadow hover:bg-gray-100"
								onClick={
									handleRemoveImage
								}
							>

								<X className="h-5 w-5 text-gray-600" />

							</button>

						</div>
					)}

					{/* PDF PREVIEW */}
					{/* PDF Preview */}
					{documentFile && (
						<div className="my-4 max-h-[250px] overflow-y-auto rounded-lg border p-2">
							<MediaPreview
								url={documentPreviewUrl || ""}
								type="pdf"
								name={documentFile.name}
								size="sm"
								showActions
							/>

							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="mt-2 w-full"
								onClick={() => {
									setDocumentFile(null)
									setDocumentPreviewUrl(null)

									if (documentInputRef.current) {
										documentInputRef.current.value = ""
									}
								}}
							>
								<X className="mr-2 h-4 w-4" />
								Remove PDF
							</Button>
						</div>
					)}

					{/* MEDIA BUTTONS */}
					<div
						className={cn(
							"flex items-center space-x-4 mt-4 pt-4 border-t",
							isMobile &&
								"flex-wrap space-x-2"
						)}
					>

						{/* IMAGE BUTTON */}
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"text-muted-foreground hover:text-foreground",
								isMobile &&
									"px-2 py-1"
							)}
							onClick={() =>
								fileInputRef.current?.click()
							}
						>

							<Camera className="mr-2 h-4 w-4" />

							<span
								className={
									isMobile
										? "sr-only"
										: ""
								}
							>
								Add Photos
							</span>

						</Button>

						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={
								handleImageChange
							}
						/>

						{/* PDF BUTTON */}
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"text-muted-foreground hover:text-foreground",
								isMobile &&
									"px-2 py-1"
							)}
							onClick={() =>
								documentInputRef.current?.click()
							}
						>

							<FileText className="mr-2 h-4 w-4" />

							<span
								className={
									isMobile
										? "sr-only"
										: ""
								}
							>
								Add PDF
							</span>

						</Button>

						<input
							ref={
								documentInputRef
							}
							type="file"
							accept=".pdf"
							className="hidden"
							onChange={
								handleDocumentChange
							}
						/>

						{/* LOCATION */}
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground"
							disabled
						>

							<MapPin className="mr-2 h-4 w-4" />

							<span
								className={
									isMobile
										? "sr-only"
										: ""
								}
							>
								Add Location
							</span>

						</Button>

					</div>

					
					{/* ACTION BUTTONS */}
					<div
						className={cn(
							"flex flex-col md:flex-row md:justify-end mt-4 gap-3 sticky bottom-0 bg-background pt-4 border-t",
							isMobile && "mt-2"
						)}
					>

						{/* CREATE LATER */}
						<Button
							variant="outline"
							disabled
							className={cn(
								isMobile &&
									"w-full py-3 text-base"
							)}
						>
							Create Later
						</Button>

						{/* CANCEL */}
						<Button
							variant="link"
							className={cn(
								"text-muted-foreground hover:text-foreground",
								isMobile &&
									"w-full py-3 text-base"
							)}
							disabled={isLoading}
							onClick={
								cancelCreatePost
							}
						>

							{isLoading
								? "Canceling..."
								: "Cancel"}

						</Button>

						{/* SUBMIT */}
						<Button
							className={cn(
								"bg-primary text-primary-foreground hover:bg-primary-800 font-medium",
								isMobile &&
									"w-full py-3 text-base"
							)}
							disabled={
								!content.trim() ||
								isLoading
							}
							onClick={
								handleSubmit
							}
						>

							{isLoading
								? "Posting..."
								: "Share Update"}

						</Button>

					</div>

				</CardContent>
			</Card>
		</div>
	)
}

export default PostCreate
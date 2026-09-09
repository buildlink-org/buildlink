import { cn } from "@/lib/utils"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Camera, FileText, X, MapPin, Save } from "lucide-react"
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
import { draftsService } from "@/services/draftsService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import MediaPreview from "@/components/ui/media-preview"
import { postContentSchema } from "@/lib/validationSchemas"
import { validateImageFile, validatePdfFile, uploadFile, revokeObjectUrl } from "@/lib/fileUtils"
import { useLocation } from "@/hooks/useLocation"
import type { PostCategory } from "@/types/posts"

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
	const [draftId, setDraftId] =
		useState<string | null>(null)

	const { location: postLocation, requestLocation, setManualLocation, clearLocation } = useLocation()

	const fileInputRef =
		useRef<HTMLInputElement>(null)

	const documentInputRef =
		useRef<HTMLInputElement>(null)

	// =====================================
	// IMAGE CHANGE (centralized validation)
	// =====================================
	const handleImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			if (!file) return

			const validation = validateImageFile(file)
			if (!validation.valid) {
				toast({
					title: "Invalid File",
					description: validation.error,
					variant: "destructive",
				})
				e.target.value = ""
				return
			}

			revokeObjectUrl(imagePreview)
			setImageFile(file)
			setImagePreview(URL.createObjectURL(file))
		},
		[imagePreview, toast]
	)

	// =====================================
	// REMOVE IMAGE
	// =====================================
	const handleRemoveImage = useCallback(() => {
		revokeObjectUrl(imagePreview)
		setImageFile(null)
		setImagePreview(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}, [imagePreview])

	// =====================================
	// DOCUMENT CHANGE (centralized validation)
	// =====================================
	const handleDocumentChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			if (!file) return

			const validation = validatePdfFile(file)
			if (!validation.valid) {
				toast({
					title: "Invalid File",
					description: validation.error,
					variant: "destructive",
				})
				e.target.value = ""
				return
			}

			revokeObjectUrl(documentPreviewUrl)
			setDocumentFile(file)
			setDocumentPreviewUrl(URL.createObjectURL(file))
		},
		[documentPreviewUrl, toast]
	)

	// =====================================
	// CLEANUP MEMORY
	// =====================================
	useEffect(() => {
		return () => {
			revokeObjectUrl(imagePreview)
			revokeObjectUrl(documentPreviewUrl)
		}
	}, [imagePreview, documentPreviewUrl])

	// =====================================
	// SAVE DRAFT (Create Later)
	// =====================================
	const handleSaveDraft = useCallback(async () => {
		if (!user) return
		setIsLoading(true)
		const { data, error } = await draftsService.saveDraft({
			id: draftId ?? undefined,
			content,
			category: postType as PostCategory,
		})
		setIsLoading(false)
		if (error) {
			toast({ title: "Error", description: "Could not save draft.", variant: "destructive" })
			return
		}
		if (data?.id) setDraftId(data.id)
		toast({ title: "Draft Saved", description: "Your draft has been saved. You can resume it later." })
	}, [user, draftId, content, postType, toast])

	// =====================================
	// CANCEL POST
	// =====================================
	const cancelCreatePost = (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		e.preventDefault()
		revokeObjectUrl(imagePreview)
		revokeObjectUrl(documentPreviewUrl)
		setContent("")
		setImageFile(null)
		setDocumentFile(null)
		setImagePreview(null)
		setDocumentPreviewUrl(null)
		setDraftId(null)
		clearLocation()
		if (fileInputRef.current) fileInputRef.current.value = ""
		if (documentInputRef.current) documentInputRef.current.value = ""
	}

	// =====================================
	// ADD LOCATION
	// =====================================
	const handleAddLocation = useCallback(() => {
		if (postLocation.lat && postLocation.lng) {
			// Already have a location, clear it
			clearLocation()
		} else {
			requestLocation()
		}
	}, [postLocation, requestLocation, clearLocation])

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
			// IMAGE UPLOAD (centralized)
			// =====================================
			if (imageFile) {
				const { url, error: uploadError } = await uploadFile(imageFile)
				if (uploadError) {
					toast({
						title: "Upload Failed",
						description: "Could not upload image.",
						variant: "destructive",
					})
					return
				}
				image_url = url ?? undefined
			}

			// =====================================
			// DOCUMENT UPLOAD (centralized)
			// =====================================
			if (documentFile) {
				const { url, error: uploadError } = await uploadFile(documentFile)
				if (uploadError) {
					toast({
						title: "Upload Failed",
						description: "Could not upload document.",
						variant: "destructive",
					})
					return
				}
				document_url = url ?? undefined
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
			setDraftId(null)
			clearLocation()

		// If draft exists, delete it after successful publish
			if (draftId) {
				await draftsService.deleteDraft(draftId)
				setDraftId(null)
			}

		} catch (error) {

			if (error instanceof Error && 'errors' in error) {
				const zodError = error as { errors: [{ message: string }] }
				toast({
					title: "Validation Error",
					description: zodError.errors[0].message,
					variant: "destructive",
				})

			} else {

				console.error(error)

				const message =
					error && typeof error === "object" && "message" in error
						? String((error as { message: unknown }).message)
						: "Failed to create post."

				toast({
					title: "Error",

					description: message,

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
		draftId,
		clearLocation,
		toast,
	])

	// =====================================
	// NOT LOGGED IN
	// =====================================
	if (!user) {

		return (
			<Card className="border-0 shadow-sm">

				<CardContent className="p-6 text-center">

					<p className="text-muted-foreground">
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

					{/* CHARACTER COUNT */}
					<div className="flex justify-end">
						<span className={cn(
							"text-xs",
							content.length > 4800 ? "text-destructive" : "text-muted-foreground"
						)}>
							{content.length}/5000
						</span>
					</div>

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
								className="absolute right-1 top-1 rounded-full bg-background p-1 shadow hover:bg-accent"
								onClick={
									handleRemoveImage
								}
							>

								<X className="h-5 w-5 text-muted-foreground" />

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

					</div>

					
					{/* LOCATION DISPLAY */}
					{postLocation.name && (
						<div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-md p-2">
							<MapPin className="h-4 w-4 text-primary" />
							<span>{postLocation.name}</span>
							<button
								type="button"
								onClick={clearLocation}
								className="ml-auto text-destructive hover:text-destructive/80"
								aria-label="Remove location"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					)}
					
					{/* MEDIA BUTTONS & DRAFT/LOCATION */}
					<div
						className={cn(
							"flex items-center justify-between mt-4 pt-4 border-t",
							isMobile && "flex-col gap-2"
						)}
					>

						<div className="flex items-center gap-2">
							{/* SAVE DRAFT BUTTON */}
							<Button
								variant="outline"
								size="sm"
								disabled={!content.trim() || isLoading}
								onClick={handleSaveDraft}
								title="Save as draft for later"
							>
								<Save className="h-4 w-4 mr-1" />
								Save Draft
							</Button>

							{/* ADD LOCATION BUTTON */}
							<Button
								variant="outline"
								size="sm"
								disabled={isLoading}
								onClick={handleAddLocation}
								title={postLocation.lat ? "Remove location" : "Add your location"}
							>
								<MapPin className="h-4 w-4 mr-1" />
								{postLocation.lat ? "Location Set" : "Add Location"}
							</Button>
						</div>

						<div className="flex gap-2">
							{/* CANCEL */}
							<Button
								variant="link"
								className={cn(
									"text-muted-foreground hover:text-foreground",
									isMobile &&
										"py-3 text-base"
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
									"bg-primary text-primary-foreground hover:bg-primary/90 font-medium",
									isMobile &&
										"py-3 text-base"
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
					</div>

				</CardContent>
			</Card>
		</div>
	)
}

export default PostCreate
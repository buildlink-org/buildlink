import { cn } from "@/lib/utils"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Camera, FileText, MapPin, X, ArrowLeft, ArrowRight, Star } from "lucide-react"
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
import MediaPreview from "@/components/ui/media-preview"
import { postContentSchema } from "@/lib/validationSchemas"
import { z } from "zod"
import { uploadPostImages, uploadPostDocument, validateUploadFile, ALLOWED_MIME, MAX_SIZE } from "@/lib/uploadUtils"

interface ImageItem {
	id: string
	file: File
	previewUrl: string
}

const PostCreate = () => {

	const { user } = useAuth()

	const { toast } = useToast()

	const isMobile = useIsMobile()

	const [postType, setPostType] =
		useState("general")

	const [content, setContent] =
		useState("")

	const [imageItems, setImageItems] =
		useState<ImageItem[]>([])

	const [documentFile, setDocumentFile] =
		useState<File | null>(null)

	const [documentPreviewUrl,
		setDocumentPreviewUrl] =
		useState<string | null>(null)

	const [isLoading, setIsLoading] =
		useState(false)

	const fileInputRef =
		useRef<HTMLInputElement>(null)

	const documentInputRef =
		useRef<HTMLInputElement>(null)

	const handleImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
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

			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
		},
		[imageItems.length, toast]
	)

	const handleRemoveImage = useCallback((id: string) => {
		setImageItems((prev) => {
			const itemToRemove = prev.find((item) => item.id === id)
			if (itemToRemove) {
				URL.revokeObjectURL(itemToRemove.previewUrl)
			}
			return prev.filter((item) => item.id !== id)
		})
	}, [])

	const moveImage = useCallback((index: number, direction: "left" | "right") => {
		setImageItems((prev) => {
			const newArr = [...prev]
			const targetIndex = direction === "left" ? index - 1 : index + 1
			if (targetIndex < 0 || targetIndex >= newArr.length) return prev
			const temp = newArr[index]
			newArr[index] = newArr[targetIndex]
			newArr[targetIndex] = temp
			return newArr
		})
	}, [])

	const makeCoverImage = useCallback((index: number) => {
		if (index === 0) return
		setImageItems((prev) => {
			const newArr = [...prev]
			const [selected] = newArr.splice(index, 1)
			newArr.unshift(selected)
			return newArr
		})
	}, [])

	const handleDocumentChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			if (!file) return

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

			if (documentPreviewUrl) {
				URL.revokeObjectURL(documentPreviewUrl)
			}

			setDocumentFile(file)
			setDocumentPreviewUrl(URL.createObjectURL(file))
		},
		[toast, documentPreviewUrl]
	)

	useEffect(() => {
		return () => {
			imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
			if (documentPreviewUrl) {
				URL.revokeObjectURL(documentPreviewUrl)
			}
		}
	}, [imageItems, documentPreviewUrl])

	const cancelCreatePost = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
		if (documentPreviewUrl) {
			URL.revokeObjectURL(documentPreviewUrl)
		}

		setContent("")
		setImageItems([])
		setDocumentFile(null)
		setDocumentPreviewUrl(null)

		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}

		if (documentInputRef.current) {
			documentInputRef.current.value = ""
		}
	}

	const handleSubmit = useCallback(async () => {
		if (!user || isLoading) return

		setIsLoading(true)

		try {
			const validatedData = postContentSchema.parse({
				content,
				category: postType,
			})

			let image_url: string | undefined
			let document_url: string | undefined

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

			imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl))
			if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)

			setContent("")
			setPostType("general")
			setImageItems([])
			setDocumentFile(null)
			setDocumentPreviewUrl(null)
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast({
					title: "Validation Error",
					description: error.errors[0].message,
					variant: "destructive",
				})
			} else {
				console.error(error)
				toast({
					title: "Error",
					description: "Failed to create post.",
					variant: "destructive",
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
		imageItems,
		documentFile,
		documentPreviewUrl,
		toast,
	])

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
		<div className={cn("space-y-6 mt-4 mb-24", isMobile && "px-0")}>
			<PostTypeSelector
				postType={postType}
				setPostType={setPostType}
			/>

			<Card className={cn("border-0 shadow-sm max-h-[90vh] overflow-y-auto", isMobile && "rounded-none")}>
				<CardContent className={cn(isMobile ? "p-2" : "p-4")}>
					<UserAvatarHeader user={user} />

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
						onChange={(e) => setContent(e.target.value)}
						className={cn("min-h-[120px] resize-none border-0 text-base p-0 w-full", isMobile && "text-sm")}
					/>

					{imageItems.length > 0 && (
						<div className="my-4 space-y-2 border-t pt-3">
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span className="font-semibold uppercase tracking-wider">
									Attached Photos ({imageItems.length}/10)
								</span>
								<span>First image is post cover</span>
							</div>

							<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
								{imageItems.map((item, idx) => (
									<div
										key={item.id}
										className={`group relative aspect-square rounded-lg border overflow-hidden bg-slate-100 ${
											idx === 0 ? "ring-2 ring-primary" : ""
										}`}
									>
										<img
											src={item.previewUrl}
											alt={`Preview ${idx + 1}`}
											className="h-full w-full object-cover"
										/>

										{idx === 0 && (
											<span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
												Cover
											</span>
										)}

										<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
											<div className="flex items-center justify-between">
												{idx > 0 && (
													<button
														type="button"
														onClick={() => makeCoverImage(idx)}
														className="bg-white/90 hover:bg-white text-yellow-600 p-1 rounded-full text-xs"
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
								className="mt-2 w-full text-destructive hover:bg-destructive/10"
								onClick={() => {
									if (documentPreviewUrl) URL.revokeObjectURL(documentPreviewUrl)
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

					<div className={cn("flex items-center space-x-4 mt-4 pt-4 border-t", isMobile && "flex-wrap space-x-2")}>
						<Button
							variant="ghost"
							size="sm"
							disabled={imageItems.length >= 10}
							className={cn("text-muted-foreground hover:text-foreground", isMobile && "px-2 py-1")}
							onClick={() => fileInputRef.current?.click()}
						>
							<Camera className="mr-2 h-4 w-4" />
							<span className={isMobile ? "sr-only" : ""}>
								{imageItems.length > 0 ? "Add More Photos" : "Add Photos"}
							</span>
						</Button>

						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={handleImageChange}
						/>

						<Button
							variant="ghost"
							size="sm"
							className={cn("text-muted-foreground hover:text-foreground", isMobile && "px-2 py-1")}
							onClick={() => documentInputRef.current?.click()}
						>
							<FileText className="mr-2 h-4 w-4" />
							<span className={isMobile ? "sr-only" : ""}>Add PDF</span>
						</Button>

						<input
							ref={documentInputRef}
							type="file"
							accept=".pdf"
							className="hidden"
							onChange={handleDocumentChange}
						/>

						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground"
							disabled
						>
							<MapPin className="mr-2 h-4 w-4" />
							<span className={isMobile ? "sr-only" : ""}>Add Location</span>
						</Button>
					</div>

					<div className={cn("flex flex-col md:flex-row md:justify-end mt-4 gap-3 sticky bottom-0 bg-background pt-4 border-t", isMobile && "mt-2")}>
						<Button variant="outline" disabled className={cn(isMobile && "w-full py-3 text-base")}>
							Create Later
						</Button>

						<Button
							variant="link"
							className={cn("text-muted-foreground hover:text-foreground", isMobile && "w-full py-3 text-base")}
							disabled={isLoading}
							onClick={cancelCreatePost}
						>
							{isLoading ? "Canceling..." : "Cancel"}
						</Button>

						<Button
							className={cn("bg-primary text-primary-foreground hover:bg-primary-800 font-medium", isMobile && "w-full py-3 text-base")}
							disabled={!content.trim() || isLoading}
							onClick={handleSubmit}
						>
							{isLoading ? "Posting..." : "Share Update"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default PostCreate
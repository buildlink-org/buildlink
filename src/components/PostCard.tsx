import { useState } from "react"
import { Share2, MoreHorizontal, Edit, Trash2, ExternalLink, ThumbsUp, MessageSquare, Repeat2, FileText, Eye, Download } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { Post } from "@/types/database"
import { useAuth } from "@/contexts/AuthContext"
import { postsService } from "@/services/postsService"
import { optimizedPostsService } from "@/services/optimizedPostsService"
import { useToast } from "@/hooks/use-toast"
import EditPostDialog from "./EditPostDialog"
import ShareDialog from "./ShareDialog"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { useNavigate } from "react-router-dom"
import { getFilenameFromUrl, handleProfileClick, downloadFile } from "@/lib/utils"
import ReadMoreText from "./ReadMore"
import { parsePostImages } from "@/lib/uploadUtils"
import MediaLightbox from "@/components/ui/media-lightbox"

interface PostCardProps {
	post: Post
	isLiked?: boolean
	onLike?: () => void
	onComment?: () => void
	onShare?: () => void
	onRepost?: () => void
	onPostUpdated?: () => void
	onPostDeleted?: () => void
	dataSaver?: boolean
	priority?: boolean
}

const PostCard = ({ post, isLiked = false, onLike, onComment, onShare, onRepost, onPostUpdated, onPostDeleted, dataSaver = false, priority = false }: PostCardProps) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const navigate = useNavigate()
	const [isLiking, setIsLiking] = useState(false)
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [showShareDialog, setShowShareDialog] = useState(false)
	const [pdfModalOpen, setPdfModalOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isPrefetching, setIsPrefetching] = useState(false)

	// Lightbox state
	const [lightboxOpen, setLightboxOpen] = useState(false)
	const [lightboxIndex, setLightboxIndex] = useState(0)

	const postImages = parsePostImages(post.image_url)

	const openLightboxAt = (index: number) => {
		setLightboxIndex(index)
		setLightboxOpen(true)
	}

	// Prefetch post data on hover
	const handleMouseEnter = async () => {
		if (!isPrefetching && !dataSaver) {
			setIsPrefetching(true)
			await optimizedPostsService.prefetchPost(post.id)
		}
	}

	const handleLike = async () => {
		if (!user || isLiking) return

		setIsLiking(true)
		try {
			await onLike?.()
		} finally {
			setIsLiking(false)
		}
	}

	const handleDelete = async () => {
		if (!user) return

		setIsDeleting(true)
		try {
			const { error } = await postsService.deletePost(post.id)

			if (error) {
				toast({
					title: "Error",
					description: "Failed to delete post",
					variant: "destructive",
				})
				return
			}

			toast({
				title: "Success",
				description: "Post deleted successfully",
			})

			// Close the dialog first
			setShowDeleteDialog(false)

			// Then trigger parent update after a brief delay to ensure proper cleanup
			setTimeout(() => {
				onPostDeleted?.()
			}, 200)
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete post",
				variant: "destructive",
			})
		} finally {
			setIsDeleting(false)
		}
	}

	const getCategoryColor = (category: string) => {
		const colors = {
			general: "bg-gray-100 text-gray-800",
			project: "bg-blue-100 text-blue-800",
			career: "bg-green-100 text-green-800",
			technical: "bg-purple-100 text-purple-800",
			news: "bg-orange-100 text-orange-800",
		}
		return colors[category as keyof typeof colors] || colors.general
	}

	const isOwnPost = user && post.author_id === user.id

	const handleDownload = async () => {
		if (!post.document_url) return
		const fileName = post.document_name || getFilenameFromUrl(post.document_url) || `document-${post.id.slice(0, 8)}.pdf`
		await downloadFile(post.document_url, fileName)
	}

	const handlePreview = () => {
		window.open(post.document_url, "_blank", "noopener,noreferrer")
	}

	return (
		<Card
			className="w-full transition-all hover:shadow-md"
			onMouseEnter={handleMouseEnter}>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="capitalize flex items-center space-x-3">
						<Avatar
							className="h-10 w-10 cursor-pointer transition-all hover:ring-2 hover:ring-primary/20"
							onClick={() => navigate(`/profile/${post.author_id}`)}
							>
							<AvatarImage src={post.profiles?.avatar || post.user?.avatar_url} />
							<AvatarFallback>{(post.profiles?.full_name || post.user?.full_name)?.charAt(0) || "U"}</AvatarFallback>
						</Avatar>
						<div>
							<p
								className="cursor-pointer text-sm font-semibold transition-colors hover:text-primary"
								onClick={() => navigate(`/profile/${post.author_id}`)}
								>
								{post.profiles?.full_name || post.user?.full_name || "Anonymous User"}
							</p>
							<div className="flex flex-col justify-start text-xs text-muted-foreground md:flex-row md:space-x-2">
								<span>{post.profiles?.profession || post.user?.profession || "No profession"}</span>
								<span className="hidden md:block">•</span>
								<span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
							</div>
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Badge
							variant="secondary"
							className={getCategoryColor(post.location || "general")}>
							{post.location || "general"}
						</Badge>
						{isOwnPost && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8">
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => setShowEditDialog(true)}>
										<Edit className="mr-2 h-4 w-4" />
										Edit Post
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setShowDeleteDialog(true)}
										className="text-destructive focus:text-destructive">
										<Trash2 className="mr-2 h-4 w-4" />
										Delete Post
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				<div className="space-y-3">
					<div>
						<p className="whitespace-pre-wrap text-muted-foreground">
							<ReadMoreText
								text={post.content}
								maxLength={300}
							/>
						</p>
					</div>

					{postImages.length > 0 && (
						<div className="overflow-hidden rounded-lg">
							{postImages.length === 1 ? (
								<div
									className="cursor-zoom-in group relative overflow-hidden rounded-lg border bg-slate-950/5"
									onClick={() => openLightboxAt(0)}
								>
									<OptimizedImage
										src={postImages[0]}
										alt="Post content"
										className="h-auto w-full max-h-[500px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
										width={dataSaver ? 300 : 600}
										quality={dataSaver ? 50 : 75}
										priority={priority}
										dataSaver={dataSaver}
									/>
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
										<span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm font-medium">
											Click to expand & zoom
										</span>
									</div>
								</div>
							) : (
								<div className={`grid gap-1.5 ${postImages.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
									{postImages.slice(0, 6).map((imgUrl, idx) => {
										const isMore = idx === 5 && postImages.length > 6
										return (
											<div
												key={idx}
												className="cursor-zoom-in group relative aspect-square overflow-hidden rounded-md border bg-slate-950/5"
												onClick={() => openLightboxAt(idx)}
											>
												<img
													src={imgUrl}
													alt={`Post image ${idx + 1}`}
													className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
												/>
												{isMore && (
													<div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-bold">
														+{postImages.length - 5} more
													</div>
												)}
											</div>
										)
									})}
								</div>
							)}
						</div>
					)}

					{/* Presentable PDF Attachment Card */}
					{post.document_url && (
						<div className="mt-3 rounded-xl border bg-slate-50 dark:bg-slate-900/50 p-3.5 transition-all hover:bg-slate-100 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center space-x-3 min-w-0 flex-1">
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
										<FileText className="h-5 w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold text-foreground">
											{post.document_name || getFilenameFromUrl(post.document_url) || "Attachment Document.pdf"}
										</p>
										<div className="flex items-center space-x-2 text-xs text-muted-foreground mt-0.5">
											<span className="inline-flex items-center rounded bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-800 dark:text-red-300">
												PDF Document
											</span>
										</div>
									</div>
								</div>

								<div className="flex items-center space-x-1.5 shrink-0">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPdfModalOpen(true)}
										className="h-8 px-2.5 text-xs font-medium gap-1.5 shadow-sm"
									>
										<Eye className="h-3.5 w-3.5" />
										<span>View PDF</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={handleDownload}
										className="h-8 w-8 text-muted-foreground hover:text-foreground"
										title="Download PDF"
									>
										<Download className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					)}

					<div className="flex items-center justify-between border-t pt-3">
						<div className="flex items-center space-x-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleLike}
								disabled={isLiking}
								className="flex items-center space-x-2 text-muted-foreground hover:text-white">
								<ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-red-500 hover:fill-white text-red-500" : ""}`} />
								<span>{post.likes_count}</span>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={onComment}
								className="flex items-center space-x-2 text-muted-foreground hover:text-white">
								<MessageSquare className="h-4 w-4" />
								<span>{post.comments_count}</span>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={onRepost}
								className="flex items-center space-x-2 text-muted-foreground hover:text-white">
								<Repeat2 className="h-4 w-4" />
								<span>{post.reposts_count}</span>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowShareDialog(true)}
								className="flex items-center space-x-2 text-muted-foreground hover:text-white">
								<Share2 className="h-4 w-4" />
								<span>{post.shares_count || 0}</span>
							</Button>
						</div>
					</div>
				</div>
			</CardContent>

			<EditPostDialog
				post={post}
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
				onPostUpdated={onPostUpdated}
			/>

			<ShareDialog
				post={post}
				open={showShareDialog}
				onOpenChange={setShowShareDialog}
				onShare={onShare}
			/>

			<AlertDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Post</AlertDialogTitle>
						<AlertDialogDescription>Are you sure you want to delete this post? This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<MediaLightbox
				images={postImages}
				initialIndex={lightboxIndex}
				open={lightboxOpen}
				onOpenChange={setLightboxOpen}
			/>

			{/* Full PDF View Modal */}
			{post.document_url && (
				<Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
					<DialogContent className="max-w-5xl h-[85vh] p-6 flex flex-col justify-between" description={`Viewing document ${post.document_name}`}>
						<DialogHeader className="flex-row items-center justify-between border-b pb-3">
							<DialogTitle className="text-base font-semibold truncate max-w-xl flex items-center gap-2">
								<FileText className="h-5 w-5 text-red-500" />
								<span>{post.document_name || getFilenameFromUrl(post.document_url) || "PDF Document"}</span>
							</DialogTitle>
							<div className="flex items-center space-x-2 shrink-0">
								<Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
									<Download className="h-3.5 w-3.5" /> Download
								</Button>
								<Button variant="outline" size="sm" onClick={handlePreview} className="gap-1.5 text-xs">
									<ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
								</Button>
							</div>
						</DialogHeader>
						<div className="flex-1 min-h-0 mt-4 rounded-lg overflow-hidden border bg-slate-900">
							<iframe src={post.document_url} className="w-full h-full border-0" title={post.document_name || "PDF Document"} />
						</div>
					</DialogContent>
				</Dialog>
			)}
		</Card>
	)
}

export default PostCard

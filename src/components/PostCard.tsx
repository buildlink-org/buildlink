import { useState } from "react"
import { Heart, MessageCircle, Share2, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
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
import { getFilenameFromUrl } from "@/lib/utils"
import ReadMoreText from "./ReadMore"

interface PostCardProps {
	post: Post
	isLiked?: boolean
	onLike?: () => void
	onComment?: () => void
	onPostUpdated?: () => void
	onPostDeleted?: () => void
	dataSaver?: boolean
	priority?: boolean
}

const PostCard = ({ post, isLiked = false, onLike, onComment, onPostUpdated, onPostDeleted, dataSaver = false, priority = false }: PostCardProps) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const navigate = useNavigate()
	const [isLiking, setIsLiking] = useState(false)
	const [showEditDialog, setShowEditDialog] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [showShareDialog, setShowShareDialog] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isPrefetching, setIsPrefetching] = useState(false)

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
			onLike?.()
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

	const handleProfileClick = () => {
		if (post.author_id) {
			navigate(`/profile/${post.author_id}`)
		}
	}

	const handleDownload = () => {
		const link = document.createElement("a")
		link.href = post.document_url
		link.download = post.document_name || `document-${post.id.slice(0, 8)}.pdf`
		link.target = "_blank"
		link.rel = "noopener noreferrer"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
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
					<div className="flex items-center space-x-3">
						<Avatar
							className="h-10 w-10 cursor-pointer transition-all hover:ring-2 hover:ring-primary/20"
							onClick={handleProfileClick}>
							<AvatarImage src={post.profiles?.avatar || post.user?.avatar_url} />
							<AvatarFallback>{(post.profiles?.full_name || post.user?.full_name)?.charAt(0) || "U"}</AvatarFallback>
						</Avatar>
						<div>
							<p
								className="cursor-pointer text-sm font-semibold transition-colors hover:text-primary"
								onClick={handleProfileClick}>
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

					{post.image_url && (
						<div className="overflow-hidden rounded-lg">
							<OptimizedImage
								src={post.image_url}
								alt="Post content"
								className="h-auto w-full object-cover"
								width={dataSaver ? 300 : 600}
								quality={dataSaver ? 50 : 75}
								priority={priority}
								dataSaver={dataSaver}
							/>
						</div>
					)}

					{/* Document Preview */}
					{post.document_url && (
						<div className="mt-3">
							{/* Simple iframe - same as media-preview */}
							<iframe
								src={post.document_url}
								className="h-96 w-full rounded-lg border"
								title={getFilenameFromUrl(post.document_url)}
							/>

							{/* Quick actions */}
							<div className="mt-2 flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handlePreview}
									className="flex items-center gap-2">
									<ExternalLink className="h-4 w-4" />
									Open PDF
								</Button>
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
								className="flex items-center space-x-2 text-muted-foreground hover:text-red-500">
								<Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
								<span>{post.likes_count}</span>
							</Button>

							<Button
								variant="ghost"
								size="sm"
								onClick={onComment}
								className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500">
								<MessageCircle className="h-4 w-4" />
								<span>{post.comments_count}</span>
							</Button>
						</div>

						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowShareDialog(true)}
							className="text-muted-foreground hover:text-green-500">
							<Share2 className="h-4 w-4" />
						</Button>
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
		</Card>
	)
}

export default PostCard

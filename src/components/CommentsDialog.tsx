import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { postsService } from "@/services/postsService"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface CommentsDialogProps {
	isOpen: boolean
	onClose: () => void
	postId: string | null
}

const CommentsDialog = ({ isOpen, onClose, postId }: CommentsDialogProps) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [comments, setComments] = useState<any[]>([])
	const [newComment, setNewComment] = useState("")
	const [loading, setLoading] = useState(false)
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		if (isOpen && postId) {
			loadComments()
		}
	}, [isOpen, postId])

	const loadComments = async () => {
		setLoading(true)
		try {
			const { data, error } = await postsService.getComments(postId)
			if (error) throw error
			setComments(data || [])
		} catch (error) {
			console.error("Error loading comments:", error)
			toast({
				title: "Error",
				description: "Failed to load comments",
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}

	const handleSubmitComment = async () => {
		if (!user || !newComment.trim()) return

		setSubmitting(true)
		try {
			const { data, error } = await postsService.createComment({
				post_id: postId,
				author_id: user.id,
				content: newComment.trim(),
			})

			if (error) throw error

			setComments((prev) => [data, ...prev])
			setNewComment("")
			toast({
				title: "Success",
				description: "Comment added successfully",
			})
		} catch (error) {
			console.error("Error creating comment:", error)
			toast({
				title: "Error",
				description: "Failed to add comment",
				variant: "destructive",
			})
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}>
			<DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
				<DialogHeader>
					<DialogTitle>Comments</DialogTitle>
				</DialogHeader>

				{/* Add comment section */}
				{user && (
					<div className="flex space-x-3 border-b p-4">
						<Avatar className="h-8 w-8">
							<AvatarImage src={user?.user_metadata?.avatar_url} />
							<AvatarFallback>{user?.user_metadata?.full_name?.charAt(0) || "U"}</AvatarFallback>
						</Avatar>
						<div className="flex-1 space-y-2">
							<Textarea
								placeholder="Write a comment..."
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								className="min-h-[60px] resize-none"
							/>
							<Button
								onClick={handleSubmitComment}
								disabled={!newComment.trim() || submitting}
								size="sm"
								className="ml-auto">
								<Send className="mr-2 h-4 w-4" />
								{submitting ? "Posting..." : "Post"}
							</Button>
						</div>
					</div>
				)}

				{/* Comments list */}
				<div className="flex-1 space-y-4 overflow-y-auto p-4">
					{loading ? (
						<div className="flex justify-center py-8">
							<div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
						</div>
					) : comments.length > 0 ? (
						comments.map((comment) => {
							const author = comment.profiles || {}

							return (
								<div
									key={comment.id}
									className="flex space-x-3">
									<Avatar className="h-8 w-8">
										<AvatarImage src={author.avatar || undefined} />
										<AvatarFallback>{author.full_name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
									</Avatar>

									<div className="flex-1">
										<div className="rounded-lg bg-gray-50 p-3">
											<div className="mb-1 flex items-center justify-between">
												<span className="text-sm font-medium">{author.full_name || "Unknown User"}</span>

												<span className="text-xs text-gray-500">{comment.created_at ? formatDistanceToNow(new Date(comment.created_at)) + " ago" : ""}</span>
											</div>

											<p className="text-sm">{comment.content || ""}</p>
										</div>
									</div>
								</div>
							)
						})
					) : (
						<p className="py-8 text-center text-gray-500">No comments yet. Be the first to comment!</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default CommentsDialog

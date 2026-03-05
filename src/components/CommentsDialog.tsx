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
	postId: string
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
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Comments</DialogTitle>
				</DialogHeader>

				{/* Add comment section */}
				{user && (
					<div className="flex space-x-3 p-4 border-b">
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
								<Send className="h-4 w-4 mr-2" />
								{submitting ? "Posting..." : "Post"}
							</Button>
						</div>
					</div>
				)}

				{/* Comments list */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{loading ? (
						<div className="flex justify-center py-8">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
						</div>
					) : comments.length > 0 ? (
						comments.map((comment) => (
							<div
								key={comment.id}
								className="flex space-x-3">
								<Avatar className="h-8 w-8">
									<AvatarImage src={comment.profiles?.avatar} />
									<AvatarFallback>{comment.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<div className="bg-gray-50 rounded-lg p-3">
										<div className="flex items-center space-x-2 mb-1">
											<span className="font-medium text-sm">{comment.profiles?.full_name}</span>
											<span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
										</div>
										<p className="text-sm">{comment.content}</p>
									</div>
								</div>
							</div>
						))
					) : (
						<p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default CommentsDialog

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCommentsStore } from "@/stores/commentsStore"
import CommentsDialog from "@/components/CommentsDialog"

const CommentsModal = () => {
	const { isOpen, postId, closeComments } = useCommentsStore()
	console.log("Modal state:", { isOpen, postId })

	return (
		<Dialog open={isOpen} onOpenChange={closeComments}>
			<DialogContent className="max-w-2xl max-h-[80vh] p-0">
				<DialogHeader>
					<DialogTitle>Comments</DialogTitle>
				</DialogHeader>

				{postId && <CommentsDialog postId={postId} />}
			</DialogContent>
		</Dialog>
	)
}

export default CommentsModal
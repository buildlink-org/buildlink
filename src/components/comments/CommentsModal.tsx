import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCommentsStore } from "@/stores/commentsStore"
import CommentsDialog from "@/components/CommentsDialog"

const CommentsModal = () => {
	const { isOpen, postId, closeComments } = useCommentsStore()

	return (
		<Dialog open={isOpen} onOpenChange={closeComments}>
			<DialogContent className="max-h-[80vh] max-w-2xl p-0">
				<DialogHeader>
					<DialogTitle>Comments</DialogTitle>
				</DialogHeader>

				{postId && <CommentsDialog postId={postId} isOpen={isOpen} />}
			</DialogContent>
		</Dialog>
	)
}

export default CommentsModal
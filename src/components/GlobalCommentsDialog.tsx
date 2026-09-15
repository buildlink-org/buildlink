import React from "react"
import CommentsDialog from "@/components/CommentsDialog"
import { useCommentsStore } from "@/stores/commentsStore"

const GlobalCommentsDialog: React.FC = () => {
	const isOpen = useCommentsStore((state) => state.isOpen)
	const postId = useCommentsStore((state) => state.postId)
	const closeComments = useCommentsStore((state) => state.closeComments)

	if (!isOpen || !postId) return null

	return (
		<CommentsDialog
			isOpen={isOpen}
			onClose={closeComments}
			postId={postId}
		/>
	)
}

export default GlobalCommentsDialog

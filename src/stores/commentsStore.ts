import { create } from "zustand"

interface CommentsState {
	isOpen: boolean
	postId: string | null

	openComments: (postId: string) => void
	closeComments: () => void
}

export const useCommentsStore = create<CommentsState>((set) => ({
	isOpen: false,
	postId: null,

	openComments: (postId) =>
        
		{set({
			isOpen: true,
			postId,
		})},

	closeComments: () =>
		set({
			isOpen: false,
			postId: null,
		}),
}))
import EmojiPicker from "emoji-picker-react"
import { Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"

interface EmojiPickerButtonProps {
	onSelect: (emoji: string) => void
}

export default function EmojiPickerButton({
	onSelect,
}: EmojiPickerButtonProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="
						h-8 w-8
						sm:h-9 sm:w-9
						rounded-full
						p-0
						shrink-0
						hover:bg-muted
						transition-colors
					"
				>
					<Smile className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="start"
				sideOffset={8}
				className="w-auto border-none p-0 shadow-lg"
			>
				<EmojiPicker
					onEmojiClick={(emojiData) => {
						onSelect(emojiData.emoji)
					}}
				/>
			</PopoverContent>
		</Popover>
	)
}
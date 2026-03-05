import EmojiPicker from "emoji-picker-react"
import { Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface EmojiPickerButtonProps {
	onSelect: (emoji: string) => void
}

export default function EmojiPickerButton({ onSelect }: EmojiPickerButtonProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="rounded-lg">
					<Smile className="h-5 w-5" />
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-auto border-none p-0 shadow-lg">
				<EmojiPicker
					onEmojiClick={(emojiData) => {
						onSelect(emojiData.emoji)
					}}
				/>
			</PopoverContent>
		</Popover>
	)
}

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
					className="h-7 w-7 rounded-full p-0"
				>
					<Smile className="h-3.5 w-3.5" />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className="
					w-auto
					p-0
					bg-background/80
					backdrop-blur-xl
					border
					border-white/10
					shadow-2xl
				"
				align="start"
			>
				<EmojiPicker
					width={400}
					height={300}
					
					onEmojiClick={(emojiData) => {
						onSelect(emojiData.emoji)
					}}
				/>
			</PopoverContent>
		</Popover>
	)
}
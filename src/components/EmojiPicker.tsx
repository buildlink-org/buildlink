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
	const isMobile = window.innerWidth < 640

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="
						h-7 w-7
						sm:h-8 sm:w-8
						rounded-full
						p-0
						shrink-0
						hover:bg-muted/50
						transition-all
					"
				>
					<Smile className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="start"
				sideOffset={8}
				className="
					w-auto
					p-0
					overflow-hidden
					bg-background/30
					backdrop-blur-xl
					border
					border-white/10
					shadow-2xl
					max-w-[95vw]
				"
			>
				<EmojiPicker
					width={isMobile ? 280 : 380}
					height={isMobile ? 220 : 300}
					lazyLoadEmojis
					searchDisabled={false}
					skinTonesDisabled={isMobile}
					previewConfig={{
						showPreview: !isMobile,
					}}
					onEmojiClick={(emojiData) => {
						onSelect(emojiData.emoji)
					}}
				/>
			</PopoverContent>
		</Popover>
	)
}
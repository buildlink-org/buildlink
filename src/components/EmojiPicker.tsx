import EmojiPicker, { Theme } from "emoji-picker-react"
import { Smile } from "lucide-react"
import { useState, useEffect } from "react"
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
	const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

		useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 640)
		}

		window.addEventListener("resize", handleResize)

		return () => window.removeEventListener("resize", handleResize)
		}, [])



	const [isDark, setIsDark] = useState(
		document.documentElement.classList.contains("dark")
	)

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIsDark(document.documentElement.classList.contains("dark"))
		})
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		})
		return () => observer.disconnect()
	}, [])

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="
					h-10
					w-10
					rounded-full
					shrink-0
					hover:bg-muted
					transition-colors
					"
				>
					<Smile className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				side="top"
				align="start"
				sideOffset={10}
				collisionPadding={16}
				className="
					p-0
					w-auto
					overflow-visible
					border-white/10
					bg-transparent
					backdrop-blur-xl
					shadow-none
					max-w-[95vw]
					max-h-[80vh]
				"
				>
				<EmojiPicker
					width={isMobile ? 300 : 380}
					height={isMobile ? 250 : 430}
					lazyLoadEmojis
					searchDisabled={false}
					skinTonesDisabled={isMobile}
					theme={isDark ? Theme.DARK : Theme.LIGHT}
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
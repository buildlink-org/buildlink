import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareProfileDialogProps {
	profileId: string
	profileName?: string | null
	/** Optional custom trigger element */
	trigger?: React.ReactNode
}

/** Public profile URL for the given id. */
const buildProfileUrl = (profileId: string): string =>
	`${window.location.origin}/profile/${profileId}`

/**
 * Share / public-preview dialog (report §8):
 * copies the public profile link or opens the native share sheet when available,
 * plus a direct "view public profile" link.
 */
const ShareProfileDialog: React.FC<ShareProfileDialogProps> = ({ profileId, profileName, trigger }) => {
	const { toast } = useToast()
	const [copied, setCopied] = useState(false)
	const url = buildProfileUrl(profileId)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
			toast({
				title: "Link copied",
				description: "Your public profile link is ready to share.",
			})
		} catch {
			toast({
				title: "Could not copy",
				description: url,
				variant: "destructive",
			})
		}
	}

	const handleNativeShare = async () => {
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({
					title: profileName ? `${profileName} on BuildLink` : "BuildLink profile",
					url,
				})
			} catch {
				// user cancelled the share sheet — no action needed
			}
		} else {
			handleCopy()
		}
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button variant="outline" size="sm" className="gap-1.5">
						<Share2 className="h-3.5 w-3.5" aria-hidden="true" />
						Share
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share your profile</DialogTitle>
					<DialogDescription>
						Anyone with this link can view your public profile.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3">
					<div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
						<p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{url}</p>
					</div>

					<div className="flex flex-col gap-2 sm:flex-row">
						<Button onClick={handleNativeShare} className="flex-1 gap-2">
							<Share2 className="h-4 w-4" aria-hidden="true" />
							Share profile
						</Button>
						<Button onClick={handleCopy} variant="outline" className="flex-1 gap-2">
							{copied ? (
								<Check className="h-4 w-4 text-green-600" aria-hidden="true" />
							) : (
								<Copy className="h-4 w-4" aria-hidden="true" />
							)}
							{copied ? "Copied" : "Copy link"}
						</Button>
					</div>

					<a
						href={url}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
						<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
						View public profile
					</a>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default ShareProfileDialog
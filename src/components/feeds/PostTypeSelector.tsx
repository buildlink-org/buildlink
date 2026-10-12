import React from "react"
import { FileText, Briefcase, Camera } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface PostType {
	id: string
	label: string
	icon: React.ElementType
	description: string
}
interface PostTypeSelectorProps {
	postType: string
	setPostType: (type: string) => void
}

const postTypes: PostType[] = [
  {
    id: "express",
    label: "Express Yourself",
    icon: FileText,
    description: "Share & discuss industry insights & experiences",
  },
  {
    id: "project",
    label: "Showcase Project",
    icon: Camera,
    description: "Display & highlight your latest and past work",
  },
  {
    id: "opportunity",
    label: "Post Opportunity",
    icon: Briefcase,
    description: "Advertise gigs, job openings & any other opportunities",
  },
]

const isTypeSelected = (typeId: string, current: string) => {
  if (typeId === "express") return current === "express" || current === "general" || current === "industry";
  if (typeId === "opportunity") return current === "opportunity" || current === "career";
  return current === typeId;
};

const PostTypeSelector: React.FC<PostTypeSelectorProps> = React.memo(({ postType, setPostType }) => {
	const isMobile = useIsMobile()
	return (
		<Card className="border-0 shadow-sm">
			<CardHeader>
				<CardTitle className="text-lg text-primary">What would you like to share?</CardTitle>
			</CardHeader>
			<CardContent>
				<div className={cn(isMobile ? "flex flex-col gap-3" : "grid grid-cols-1 gap-3")}>
					{postTypes.map((type) => {
						const Icon = type.icon
						const isSelected = isTypeSelected(type.id, postType);
						return (
							<button
								key={type.id}
								onClick={() => setPostType(type.id)}
								type="button"
								aria-pressed={isSelected}
								className={cn(
									"p-4 rounded-lg border-2 text-left transition-all flex-1 focus:outline-none focus:ring-2 focus:ring-primary",
									isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
								)}
								style={isMobile ? { minHeight: 56, minWidth: 0 } : {}}>
								<div className="flex items-start space-x-3">
									<Icon className={cn("h-6 w-6 mt-1", isSelected ? "text-primary" : "text-muted-foreground")} />
									<div>
										<h3 className={cn("font-medium", isSelected ? "text-primary" : "text-foreground")}>{type.label}</h3>
										<p className="text-sm text-muted-foreground">{type.description}</p>
									</div>
								</div>
							</button>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
})

PostTypeSelector.displayName = "PostTypeSelector"
export { PostTypeSelector }
export default PostTypeSelector

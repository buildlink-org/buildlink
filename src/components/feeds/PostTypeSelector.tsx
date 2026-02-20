import React from "react"
import { FileText, Briefcase, Camera, Users } from "lucide-react"
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
	{ id: "update", label: "Share Update", icon: FileText, description: "Share project milestones, insights, or industry thoughts" },
	{ id: "job", label: "Post Job", icon: Briefcase, description: "Advertise job openings, gigs, or project opportunities" },
	{ id: "project", label: "Showcase Project", icon: Camera, description: "Display your latest work and achievements" },
	{ id: "collaboration", label: "Seek Collaboration", icon: Users, description: "Find partners for projects or business ventures" },
]

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
						return (
							<button
								key={type.id}
								onClick={() => setPostType(type.id)}
								type="button"
								className={cn("p-4 rounded-lg border-2 text-left transition-all flex-1 focus:outline-none focus:ring-2 focus:ring-primary", postType === type.id ? "border-primary bg-primary-50" : "border-gray-200 hover:border-primary-300")}
								style={isMobile ? { minHeight: 56, minWidth: 0 } : {}}>
								<div className="flex items-start space-x-3">
									<Icon className={cn("h-6 w-6 mt-1", postType === type.id ? "text-primary" : "text-gray-600")} />
									<div>
										<h3 className={cn("font-medium", postType === type.id ? "text-primary" : "text-gray-800")}>{type.label}</h3>
										<p className="text-sm text-gray-600">{type.description}</p>
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
export default PostTypeSelector

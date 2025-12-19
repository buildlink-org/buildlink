import { Card, CardContent } from "@/components/ui/card"
import { UserProfile } from "@/types"

interface ConnectionsInterestsSectionProps {
	profile: UserProfile
}

const ConnectionsInterestsSection = ({ profile }: ConnectionsInterestsSectionProps) => {
	const userType = profile?.user_type?.toLowerCase() || "student"
	
	// Get color scheme based on user type
	let squareColor = "bg-yellow-200"
	let moreTextColor = "text-amber-900"
	
	if (userType === "professional") {
		squareColor = "bg-orange-200"
		moreTextColor = "text-orange-900"
	} else if (userType === "company") {
		squareColor = "bg-green-200"
		moreTextColor = "text-green-900"
	}

	// Mock data - replace with actual connections and interests
	const connections: any[] = [] // TODO: Fetch actual connections
	const interests: any[] = profile?.interests || []

	return (
		<div className="space-y-6">
			{/* Connections Section */}
			<Card className="border-0 shadow-sm">
				<CardContent className="rounded-md px-4 py-4 shadow-md">
					<div className="flex items-center gap-4">
						<h2 className="text-lg font-semibold text-gray-800 min-w-[120px]">Connections</h2>
						<div className="flex items-center gap-3 flex-1">
							{/* Three cards with increasing square sizes */}
							{[0, 1, 2].map((index) => (
								<div
									key={index}
									className="flex-1 max-w-[120px] h-24 border border-gray-300 rounded-lg bg-white flex items-center justify-start p-3"
								>
									<div
										className={`${squareColor} rounded-lg ${
											index === 0
												? "w-8 h-8"
												: index === 1
												? "w-12 h-12"
												: "w-16 h-16"
										}`}
									/>
								</div>
							))}
							<span className={`${moreTextColor} font-medium text-sm ml-2`}>More</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Interests Section */}
			<Card className="border-0 shadow-sm">
				<CardContent className="rounded-md px-4 py-4 shadow-md">
					<div className="flex items-center gap-4">
						<h2 className="text-lg font-semibold text-gray-800 min-w-[120px]">Interests</h2>
						<div className="flex items-center gap-3 flex-1">
							{/* Three cards with increasing square sizes */}
							{[0, 1, 2].map((index) => (
								<div
									key={index}
									className="flex-1 max-w-[120px] h-24 border border-gray-300 rounded-lg bg-white flex items-center justify-start p-3"
								>
									<div
										className={`${squareColor} rounded-lg ${
											index === 0
												? "w-8 h-8"
												: index === 1
												? "w-12 h-12"
												: "w-16 h-16"
										}`}
									/>
								</div>
							))}
							<span className={`${moreTextColor} font-medium text-sm ml-2`}>More</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default ConnectionsInterestsSection


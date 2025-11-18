import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Users, Briefcase, TrendingUp, Eye, Plus } from "lucide-react"
import AccountTypeFeatures from "./AccountTypeFeatures"
import { UserProfile } from "@/types"

interface CompanyDashboardProps {
	profile: UserProfile
}

const CompanyDashboard = ({ profile }: CompanyDashboardProps) => {
	return (
		<div className="space-y-6">
			{/* Welcome Message */}
			<Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
				<CardHeader>
					<div className="flex items-center gap-2">
						<Building2 className="h-6 w-6 text-purple-600" />
						<CardTitle className="text-purple-900">Welcome to {profile.organization || "Your Company"}!</CardTitle>
					</div>
					<CardDescription className="text-purple-700">🏢 Build your brand, showcase projects, and connect with top talent in the built environment.</CardDescription>
				</CardHeader>
			</Card>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Project Views</p>
								<p className="text-2xl font-bold">0</p>
							</div>
							<Eye className="h-8 w-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Active Jobs</p>
								<p className="text-2xl font-bold">0</p>
							</div>
							<Briefcase className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Team Members</p>
								<p className="text-2xl font-bold">0</p>
							</div>
							<Users className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Engagement</p>
								<p className="text-2xl font-bold">0%</p>
							</div>
							<TrendingUp className="h-8 w-8 text-orange-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Action Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="h-5 w-5" />
							Showcase Projects
						</CardTitle>
						<CardDescription>Feature your built works, proposals, and competitions on the homepage</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className="w-full">
							<Plus className="mr-2 h-4 w-4" />
							Add Project
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Briefcase className="h-5 w-5" />
							Post Job Opportunities
						</CardTitle>
						<CardDescription>Access our talent pool of students, graduates, and professionals</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							className="w-full">
							<Plus className="mr-2 h-4 w-4" />
							Post Job
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Team Integration
						</CardTitle>
						<CardDescription>Link staff accounts to your firm profile for better visibility</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							className="w-full">
							Manage Team
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="h-5 w-5" />
							Host Events & Tenders
						</CardTitle>
						<CardDescription>Create calls for collaboration, competitions, and RFPs</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							className="w-full">
							Create Event
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Premium Features Highlight */}
			<Card className="border-yellow-200 bg-yellow-50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-yellow-900">
						<Building2 className="h-5 w-5" />
						Premium Company Features
					</CardTitle>
					<CardDescription className="text-yellow-700">Unlock premium visibility and advanced analytics for your company profile</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="bg-yellow-100 text-yellow-800">
								Premium
							</Badge>
							<span className="text-sm">Featured project placement on homepage</span>
						</div>
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="bg-yellow-100 text-yellow-800">
								Analytics
							</Badge>
							<span className="text-sm">Advanced engagement metrics for projects and job postings</span>
						</div>
						<Button className="mt-4">Upgrade to Premium</Button>
					</div>
				</CardContent>
			</Card>

			{/* Account Features */}
			<AccountTypeFeatures userType="company" />
		</div>
	)
}

export default CompanyDashboard

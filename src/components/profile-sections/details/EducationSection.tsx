import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import EducationEditDialog from "@/components/profile-sections/EducationEditDialog";
import { Education, UserProfile } from "@/types";

interface EducationSectionProps {
  profile: UserProfile;
  handleProfileUpdate: () => void;
  maxVisible?: number;
  canEdit?: boolean;
}

const EducationSection = ({ profile, handleProfileUpdate, maxVisible, canEdit = true }: EducationSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const education = profile.education || [];
  const defaultLimit = 2
  const limit = isExpanded ? education.length : defaultLimit
  const visibleEducation = education.slice(0, limit);
  const hasMore = education.length > defaultLimit

  const userType = profile.user_type?.toLowerCase() || "student";
  let iconBg = "bg-yellow-100";
  let iconText = "text-yellow-700";
  if (userType === "professional") {
    iconBg = "bg-orange-100";
    iconText = "text-orange-700";
  } else if (userType === "company") {
    iconBg = "bg-green-100";
    iconText = "text-green-700";
  }

  return (
		<div className="relative pl-4 pr-4">
			{/* Left bracket */}
			<div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-light z-10">
				{"{"}
			</div>
			
			{/* Right bracket */}
			<div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-light z-10">
				{"}"}
			</div>

			<Card className="border border-gray-300 rounded-lg shadow-sm">
				<CardContent className="px-4 py-4">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-semibold text-gray-800">Education & Training</h2>
						{canEdit && (
							<EducationEditDialog
								currentProfile={profile}
								onProfileUpdated={handleProfileUpdate}>
								<Button
									variant="ghost"
									size="sm"
									className="h-8 w-8 p-0">
									<Edit className="h-4 w-4" />
								</Button>
							</EducationEditDialog>
						)}
					</div>
					<div className="space-y-4">
						{education.length > 0 ? (
							<>
							{visibleEducation.map((edu: Education, index: number) => (
								<div
									key={index}
									className="flex space-x-4">
									<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
										<GraduationCap className={`h-6 w-6 ${iconText}`} />
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-gray-900">{edu.degree || "[Degree/Certificate]"}</h3>
										<p className="text-gray-600">{edu.institution || "[Institution]"}</p>
										<p className="text-sm text-gray-500">{edu.year || "[Year]"}</p>
										{edu.description && <p className="mt-2 text-sm text-gray-700">{edu.description}</p>}
									</div>
								</div>
							))}
							{hasMore && (
								<button
									type="button"
									className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
									onClick={() => setIsExpanded(!isExpanded)}
								>
									{isExpanded ? (
										<>
											<ChevronUp className="h-4 w-4" />
											Read less
										</>
									) : (
										<>
											<ChevronDown className="h-4 w-4" />
											Read more ({education.length - defaultLimit} more)
										</>
									)}
								</button>
							)}
							</>
						) : (
							<p className="text-gray-500">No education added yet. Click edit to add your educational background.</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
  )
};

export default EducationSection;

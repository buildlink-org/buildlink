import { Award, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { skillsService } from "@/services/skillsService";
import { Skeleton } from "@/components/ui/skeleton";

const SkillUpHeader = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['skillUpStats'],
    queryFn: skillsService.getStats
  });

  return (
		<div className="rounded-xl bg-gradient-to-r from-primary to-primary/90 p-6 text-white">
			<h2 className="mb-2 text-2xl font-bold">Resource Hub</h2>
			<p className="mb-4 text-primary-100">Your One-Stop shop to help stay relevant, manage projects efficiently, and ensure compliance.</p>
			<div className="flex items-center justify-center py-10">
				<h2 className="text-3xl font-bold text-white">
					Coming Soon
				</h2>
			</div>
		</div>
  )
};

export default SkillUpHeader;

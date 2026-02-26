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
			<div className="grid grid-cols-2 gap-4">
				<div className="rounded-lg bg-white/10 p-3 text-center">
					<BookOpen className="mx-auto mb-2 h-6 w-6" />
					<div className="text-lg font-bold">{isLoading ? <Skeleton className="mx-auto h-6 w-12 bg-white/20" /> : `${statsData?.data?.coursesCount ?? 0}+`}</div>
					<div className="text-xs">Courses Available</div>
				</div>
				<div className="rounded-lg bg-white/10 p-3 text-center">
					<Award className="mx-auto mb-2 h-6 w-6" />
					<div className="text-lg font-bold">500+</div>
					<div className="text-xs">CPD Points Earned</div>
				</div>
			</div>
		</div>
  )
};

export default SkillUpHeader;

import { Award, BookOpen, GraduationCap, Users, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { skillsService } from "@/services/skillsService";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | undefined;
  isLoading: boolean;
}

const StatCard = ({ icon: Icon, label, value, isLoading }: StatCardProps) => (
  <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div>
      {isLoading ? (
        <Skeleton className="h-5 w-16 bg-white/20" />
      ) : (
        <p className="text-xl font-bold text-white">{value ?? 0}</p>
      )}
      <p className="text-xs text-primary-100">{label}</p>
    </div>
  </div>
);

const SkillUpHeader = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['skillUpStats'],
    queryFn: skillsService.getStats
  });

  const stats = statsData?.data;

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary to-primary/90 p-6 text-white">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resource Hub</h2>
          <p className="mt-1 text-primary-100">
            Courses, webinars, articles & certifications to help you grow
          </p>
        </div>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          <BookOpen className="mr-1 h-3 w-3" />
          Learning Hub
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={GraduationCap} label="Courses" value={stats?.coursesCount} isLoading={isLoading} />
        <StatCard icon={Users} label="Webinars" value={stats?.webinarsCount} isLoading={isLoading} />
        <StatCard icon={FileText} label="Articles" value={stats?.articlesCount} isLoading={isLoading} />
        <StatCard icon={Award} label="Certifications" value={stats?.certificationsCount} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default SkillUpHeader;

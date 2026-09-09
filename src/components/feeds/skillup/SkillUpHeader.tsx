import { Award, BookOpen, Newspaper, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { skillsService } from "@/services/skillsService";
import { Skeleton } from "@/components/ui/skeleton";

const SkillUpHeader = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['skillUpStats'],
    queryFn: skillsService.getStats
  });

  const stats = statsData?.data;

  const statItems = [
    { icon: BookOpen, label: "Courses", value: stats?.coursesCount },
    { icon: Video, label: "Webinars", value: stats?.webinarsCount },
    { icon: Newspaper, label: "Articles", value: stats?.articlesCount },
    { icon: Award, label: "Certifications", value: stats?.certificationsCount },
  ].filter((item) => typeof item.value === "number");

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary to-primary/90 p-6 text-primary-foreground shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="mb-1 text-2xl font-bold">Resource Hub</h2>
          <p className="text-sm text-primary-foreground/90">
            Your one-stop shop to stay relevant, manage projects efficiently, and ensure compliance.
          </p>
        </div>
        {isLoading ? (
          <Skeleton className="h-16 w-full rounded-lg bg-primary-foreground/20 sm:w-64" />
        ) : statItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {statItems.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg bg-primary-foreground/15 px-3 py-2 backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <div className="min-w-0 leading-tight">
                  <div className="text-sm font-bold">{value}</div>
                  <div className="truncate text-[11px] text-primary-foreground/80">{label}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
};

export default SkillUpHeader;

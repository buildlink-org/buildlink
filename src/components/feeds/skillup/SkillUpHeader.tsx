import { Award, BookOpen, Loader2, Newspaper, RefreshCw, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { skillsService } from "@/services/skillsService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SkillUpHeader = () => {
  const { data: stats, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['skillUpStats'],
    queryFn: skillsService.getStats,
  });

  const statItems = [
    { icon: BookOpen, label: "Courses", value: stats?.coursesCount ?? 0 },
    { icon: Video, label: "Webinars", value: stats?.webinarsCount ?? 0 },
    { icon: Newspaper, label: "Articles", value: stats?.articlesCount ?? 0 },
    { icon: Award, label: "Certifications", value: stats?.certificationsCount ?? 0 },
  ];

  return (
    <header className="relative overflow-hidden rounded-2xl shadow-xl">
      {/* Rich layered background */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(135deg, hsl(12 65% 28%) 0%, hsl(12 65% 38%) 40%, hsl(8 92% 30%) 100%)",
        }}
      />

      {/* Dot-grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Glowing orb accents */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-20 blur-3xl"
        aria-hidden
        style={{ background: "hsl(8 92% 55%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full opacity-15 blur-2xl"
        aria-hidden
        style={{ background: "hsl(12 65% 70%)" }}
      />

      {/* Content */}
      <div className="relative px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Title block */}
          <div className="min-w-0">
            <div className="mb-0.5 flex items-center gap-2">
              <span
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white"
                style={{ background: "hsl(8 92% 40% / 0.5)" }}
                aria-hidden
              >
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Resource Hub
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-white sm:text-3xl">
              Level Up Your Practice
            </h2>
            <p className="mt-1.5 max-w-lg text-sm text-white/75 leading-relaxed">
              Curated courses, webinars, articles, and certifications for Kenya's built-environment professionals.
            </p>
          </div>

          {/* Stats block */}
          <div className="flex-shrink-0">
            {isLoading ? (
              <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                <span className="text-sm text-white/70">Loading stats…</span>
              </div>
            ) : error ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => refetch()}
                aria-label="Retry loading statistics"
                className="bg-white/15 text-white hover:bg-white/25 border-0"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry stats
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
                {statItems.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 rounded-xl px-3 py-2.5 text-center backdrop-blur-sm transition-colors",
                      "bg-white/10 hover:bg-white/20",
                      isFetching && !isLoading && "animate-pulse"
                    )}
                  >
                    <Icon
                      className="h-4 w-4 text-white/70 group-hover:text-white transition-colors"
                      aria-hidden
                    />
                    <div className="text-lg font-bold leading-none text-white tabular-nums">
                      {value}
                    </div>
                    <div className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SkillUpHeader;


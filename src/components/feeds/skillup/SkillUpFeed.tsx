import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { skillsService } from "@/services/skillsService";
import { resourcesEnrollmentService } from "@/services/resourcesEnrollmentService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, RefreshCw, BookOpen } from "lucide-react";
import SkillUpHeader from "./SkillUpHeader";
import CourseItem from "./CourseItem";
import WebinarItem from "./WebinarItem";
import ArticleItem from "./ArticleItem";
import CertificationItem from "./CertificationItem";
import ProfessionalBodiesCard from "./ProfessionalBodiesCard";

interface SkillResource {
  id: string;
  type: string;
  title: string;
  provider: string;
  description: string;
  duration: string | null;
  difficulty_level: string | null;
  rating: number | null;
  reviews_count: number | null;
  syllabus: unknown[] | null;
  price: number | null;
  thumbnail: string;
  link: string;
  category: string | null;
  learning_outcomes: string[] | null;
  prerequisites: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

interface SkillUpFeedProps {
  activeFilter?: string;
}

/* ── Loading skeleton ─────────────────────────────────────────── */
const FeedSkeleton = () => (
  <div className="space-y-6" aria-live="polite" aria-busy="true">
    <SkillUpHeader />
    {[1, 2].map((s) => (
      <div key={s} className="space-y-3">
        {/* Section heading placeholder */}
        <div className="flex items-center gap-3">
          <div className="h-5 w-32 rounded animate-shimmer" />
          <div className="h-5 w-12 rounded-full animate-shimmer" />
        </div>
        {/* Card placeholders */}
        {[1, 2].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 shrink-0 rounded-xl animate-shimmer" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 w-3/4 rounded animate-shimmer" />
                  <div className="h-3 w-1/3 rounded animate-shimmer" />
                  <div className="h-3 w-full rounded animate-shimmer" />
                  <div className="h-3 w-2/3 rounded animate-shimmer" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ))}
  </div>
);

/* ── Error state ──────────────────────────────────────────────── */
const FeedError = ({ onRetry }: { onRetry: () => void }) => (
  <div className="space-y-6" aria-live="polite" aria-busy="false">
    <SkillUpHeader />
    <Card className="border-0 shadow-sm">
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Could not load resources</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong fetching the Resource Hub. Check your connection and try again.
          </p>
        </div>
        <Button onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

/* ── Section empty state ─────────────────────────────────────── */
const SectionEmpty = ({ text, onRetry }: { text: string; onRetry: () => void }) => (
  <Card className="border-0 shadow-sm">
    <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
      <BookOpen className="h-8 w-8 opacity-30" aria-hidden />
      <p className="text-sm">{text}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
        <RefreshCw className="h-3.5 w-3.5" />
        Refresh
      </Button>
    </CardContent>
  </Card>
);

/* ── Section header ──────────────────────────────────────────── */
const SectionHeader = ({ title, count }: { title: string; count: number }) => (
  <div className="flex items-center gap-3">
    <span className="h-5 w-1 rounded-full bg-primary" aria-hidden />
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    <Badge variant="secondary" className="ml-auto text-xs">
      {count === 1 ? "1 item" : `${count} items`}
    </Badge>
  </div>
);

/* ── Main component ──────────────────────────────────────────── */
const SkillUpFeed = ({ activeFilter }: SkillUpFeedProps) => {
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources, isLoading, error, refetch } = useQuery({
    queryKey: ["skillResources"],
    queryFn: () => skillsService.getSkillResources(),
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: enrolledIds,
    isLoading: isEnrolledLoading,
    error: enrolledError,
    refetch: refetchEnrolled,
  } = useQuery({
    queryKey: ["enrolledResourceIds"],
    queryFn: () => resourcesEnrollmentService.getEnrolledResourceIds(),
    staleTime: 5 * 60 * 1000,
  });

  const enrollMutation = useMutation({
    mutationFn: (resourceId: string) => resourcesEnrollmentService.enroll(resourceId),
    onSuccess: (_data, resourceId) => {
      setEnrolledCourses((prev) => (prev.includes(resourceId) ? prev : [...prev, resourceId]));
      queryClient.invalidateQueries({ queryKey: ["enrolledResourceIds"] });
      toast({
        title: "Enrolled",
        description: "You have been enrolled in this course.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Enrollment failed",
        description: "Could not enroll in this course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const allResources: SkillResource[] = resources ?? [];
  const courses = allResources.filter((r) => r.type === "course");
  const webinars = allResources.filter((r) => r.type === "webinar");
  const articles = allResources.filter((r) => r.type === "article");
  const certifications = allResources.filter((r) => r.type === "certification");
  const effectiveEnrolled = Array.from(new Set([...enrolledCourses, ...(enrolledIds ?? [])]));

  const handleEnroll = (courseId: string) => {
    if (effectiveEnrolled.includes(courseId)) return;
    enrollMutation.mutate(courseId);
  };

  if (isLoading || isEnrolledLoading) return <FeedSkeleton />;
  if (error || enrolledError) {
    return (
      <FeedError
        onRetry={() => {
          refetch();
          refetchEnrolled();
        }}
      />
    );
  }

  const isLatest = !activeFilter || activeFilter === "latest";

  const sections = [
    {
      id: "courses",
      title: "Featured Courses",
      items: courses,
      emptyText: "No courses yet. Check back soon!",
      renderItem: (course: SkillResource) => (
        <CourseItem
          key={course.id}
          course={course}
          enrolledCourses={effectiveEnrolled}
          handleEnroll={handleEnroll}
          isEnrolling={enrollMutation.isPending && enrollMutation.variables === course.id}
        />
      ),
    },
    {
      id: "webinars",
      title: "Upcoming Webinars",
      items: webinars,
      emptyText: "No webinars scheduled yet.",
      renderItem: (webinar: SkillResource) => <WebinarItem key={webinar.id} webinar={webinar} />,
    },
    {
      id: "articles",
      title: "Featured Articles",
      items: articles,
      emptyText: "No articles published yet.",
      renderItem: (article: SkillResource) => <ArticleItem key={article.id} article={article} />,
    },
    {
      id: "certifications",
      title: "Professional Certifications",
      items: certifications,
      emptyText: "No certifications available yet.",
      renderItem: (cert: SkillResource) => <CertificationItem key={cert.id} certification={cert} />,
    },
  ].filter((section) => isLatest || activeFilter === section.id);

  const hasAnyContent = sections.some((s) => s.items.length > 0);

  return (
    <div className="space-y-6">
      <SkillUpHeader />

      <div className="space-y-8">
        {/* Global empty state — only shown in "latest" view when nothing exists */}
        {isLatest && !hasAnyContent && (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground/50" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-foreground">No resources yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  New courses, webinars, and articles will appear here as they're published.
                </p>
              </div>
              <Button variant="outline" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {sections.map((section, sectionIdx) => (
          <section key={section.id} className="space-y-3">
            <SectionHeader title={section.title} count={section.items.length} />

            {section.items.length > 0 ? (
              <div
                className="space-y-3"
                role="group"
                aria-label={`${section.title}, ${section.items.length === 1 ? "1 item" : `${section.items.length} items`}`}
              >
                {section.items.map((item, itemIdx) => (
                  <div
                    key={item.id}
                    className="animate-card-in"
                    style={{ animationDelay: `${(sectionIdx * 2 + itemIdx) * 60}ms` }}
                  >
                    {section.renderItem(item)}
                  </div>
                ))}
              </div>
            ) : (
              /* Per-section empty only shown when actively filtered to that section */
              !isLatest && <SectionEmpty text={section.emptyText} onRetry={refetch} />
            )}
          </section>
        ))}

        <ProfessionalBodiesCard />
      </div>
    </div>
  );
};

export default SkillUpFeed;


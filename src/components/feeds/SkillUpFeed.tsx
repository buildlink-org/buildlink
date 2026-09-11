import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { skillsService } from "@/services/skillsService";
import { resourcesEnrollmentService } from "@/services/resourcesEnrollmentService";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import SkillUpHeader from "./skillup/SkillUpHeader";
import CourseItem from "./skillup/CourseItem";
import WebinarItem from "./skillup/WebinarItem";
import ArticleItem from "./skillup/ArticleItem";
import CertificationItem from "./skillup/CertificationItem";
import ProfessionalBodiesCard from "./skillup/ProfessionalBodiesCard";

interface SkillUpFeedProps {
  activeFilter: string;
}

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

const SkillUpFeed = ({ activeFilter }: SkillUpFeedProps) => {
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources, isLoading, error, refetch } = useQuery({
    queryKey: ['skillResources'],
    queryFn: () => skillsService.getSkillResources(),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch the user's existing enrollments so we can reflect persisted state
  const { data: enrolledIds = [] } = useQuery({
    queryKey: ['enrolledResourceIds'],
    queryFn: () => resourcesEnrollmentService.getEnrolledResourceIds(),
    staleTime: 5 * 60 * 1000,
  });

  const enrollMutation = useMutation({
    mutationFn: (resourceId: string) => resourcesEnrollmentService.enroll(resourceId),
    onSuccess: (_data, resourceId) => {
      setEnrolledCourses((prev) => prev.includes(resourceId) ? prev : [...prev, resourceId]);
      queryClient.invalidateQueries({ queryKey: ["enrolledResourceIds"] });
      toast({
        title: "Enrolled",
        description: "You've been enrolled in this course.",
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

  const handleEnroll = (courseId: string) => {
    if (enrolledCourses.includes(courseId)) return;
    enrollMutation.mutate(courseId);
  };

  const allResources: SkillResource[] = resources ?? [];

  const courses = allResources.filter(r => r.type === 'course');
  const webinars = allResources.filter(r => r.type === 'webinar');
  const articles = allResources.filter(r => r.type === 'article');
  const certifications = allResources.filter(r => r.type === 'certification');

  const effectiveEnrolled = Array.from(new Set([...enrolledCourses, ...enrolledIds]));

  // Accessible loading announcement
  if (isLoading) {
    return (
      <div className="space-y-6" aria-live="polite" aria-busy={true}>
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SkillUpHeader />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="font-medium text-destructive">Could not load resources</p>
            <p className="text-sm text-muted-foreground">
              Something went wrong while fetching the resource hub. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const itemCountLabel = (count: number) => (count === 1 ? "1 item" : `${count} items`);

  const sections: { id: string; title: string; items: SkillResource[]; emptyText: string; renderItem: (item: SkillResource) => React.ReactNode }[] = [
    {
      id: "courses",
      title: "Featured Courses",
      items: courses,
      emptyText: "No courses yet",
      renderItem: (course) => (
        <CourseItem
          key={course.id}
          course={course}
          enrolledCourses={effectiveEnrolled}
          handleEnroll={handleEnroll}
          isEnrolling={enrollMutation.isPending}
        />
      ),
    },
    {
      id: "webinars",
      title: "Upcoming Webinars",
      items: webinars,
      emptyText: "No webinars yet",
      renderItem: (webinar) => <WebinarItem key={webinar.id} webinar={webinar} />,
    },
    {
      id: "articles",
      title: "Featured Articles",
      items: articles,
      emptyText: "No articles yet",
      renderItem: (article) => <ArticleItem key={article.id} article={article} />,
    },
    {
      id: "certifications",
      title: "Professional Certifications",
      items: certifications,
      emptyText: "No certifications yet",
      renderItem: (cert) => <CertificationItem key={cert.id} certification={cert} />,
    },
  ].filter((section) => activeFilter === "latest" || activeFilter === section.id);

  const hasAnyContent = sections.length > 0 && sections.some(s => s.items.length > 0);

  return (
    <div className="space-y-6">
      <SkillUpHeader />

      <div className="space-y-8">
        {!hasAnyContent && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No resources yet. Check back soon for new content.</p>
              <Button variant="outline" onClick={() => refetch()} className="mt-3">
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {sections.map((section) => (
          <section key={section.id} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              <Badge variant="secondary">{itemCountLabel(section.items.length)}</Badge>
            </div>

            {section.items.length > 0 ? (
              <div
                className="space-y-3"
                role="group"
                aria-label={`${section.title}, ${itemCountLabel(section.items.length)}`}
              >
                {section.items.map((item) => section.renderItem(item))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {section.emptyText}
              </p>
            )}
          </section>
        ))}

        <ProfessionalBodiesCard />
      </div>
    </div>
  );
};

export default SkillUpFeed;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { skillsService } from "@/services/skillsService";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import SkillUpHeader from "./skillup/SkillUpHeader";
import CourseItem from "./skillup/CourseItem";
import WebinarItem from "./skillup/WebinarItem";
import ArticleItem from "./skillup/ArticleItem";
import CertificationItem from "./skillup/CertificationItem";
import ProfessionalBodiesCard from "./skillup/ProfessionalBodiesCard";

interface SkillUpFeedProps {
  activeFilter: string;
}

const SkillUpFeed = ({ activeFilter }: SkillUpFeedProps) => {
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  const { data: resourcesData, isLoading, error, refetch } = useQuery({
    queryKey: ['skillResources'],
    queryFn: () => skillsService.getSkillResources(),
  });

  const handleEnroll = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
    // Here you would typically make an API call to enroll the user
    console.log(`Enrolled in course ${courseId}`);
  };

  const allResources = resourcesData?.data || [];

  const courses = allResources.filter(r => r.type === 'course');
  const webinars = allResources.filter(r => r.type === 'webinar');
  const articles = allResources.filter(r => r.type === 'article');
  const certifications = allResources.filter(r => r.type === 'certification');

  if (isLoading) {
    return (
      <div className="space-y-6">
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
            <p className="text-sm text-muted-foreground">Something went wrong while fetching the resource hub. Please try again.</p>
            <Button onClick={() => refetch()} className="mt-1">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const itemCountLabel = (count: number) => (count === 1 ? "1 item" : `${count} items`);

  const sections: { id: string; title: string; items: typeof courses; emptyText: string; renderItem: (item: any) => React.ReactNode }[] = [
    {
      id: "courses",
      title: "Featured Courses",
      items: courses,
      emptyText: "No courses yet",
      renderItem: (course) => (
        <CourseItem
          key={course.id}
          course={course}
          enrolledCourses={enrolledCourses}
          handleEnroll={handleEnroll}
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

  return (
    <div className="space-y-6">
      <SkillUpHeader />

      <div className="space-y-8">
        {sections.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No resources yet. Check back soon for new content.
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
              <div className="space-y-3">
                {section.items.map((item) => section.renderItem(item))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {section.emptyText}
              </p>
            )}
          </section>
        ))}
      </div>

      <ProfessionalBodiesCard />
    </div>
  );
};

export default SkillUpFeed;

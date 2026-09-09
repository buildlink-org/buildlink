import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { skillsService } from "@/services/skillsService";
import { resourcesEnrollmentService } from "@/services/resourcesEnrollmentService";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { AlertCircle, RefreshCw, BookOpen, Video, FileText, Award } from "lucide-react";
import SkillUpHeader from "./skillup/SkillUpHeader";
import CourseItem from "./skillup/CourseItem";
import WebinarItem from "./skillup/WebinarItem";
import ArticleItem from "./skillup/ArticleItem";
import CertificationItem from "./skillup/CertificationItem";
import ProfessionalBodiesCard from "./skillup/ProfessionalBodiesCard";

interface SkillUpFeedProps {
  activeFilter: string;
}
interface SectionConfig {
  key: string;
  label: string;
  icon: React.ElementType;
  filters: string[];
}

const sections: SectionConfig[] = [
  { key: "courses", label: "Courses", icon: BookOpen, filters: ["courses", "latest"] },
  { key: "webinars", label: "Upcoming Webinars", icon: Video, filters: ["webinars", "latest"] },
  { key: "articles", label: "Featured Articles", icon: FileText, filters: ["articles", "latest"] },
  { key: "certifications", label: "Professional Certifications", icon: Award, filters: ["certifications", "latest"] },
];

const FilteredEmptyState = ({ label, icon: Icon }: { label: string; icon: React.ElementType }) => (
  <Card>
    <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-foreground">No {label.toLowerCase()} yet</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Resources will appear here once they are added by the admin.
      </p>
    </CardContent>
  </Card>
);

const SkillUpFeed = ({ activeFilter }: SkillUpFeedProps) => {
  const queryClient = useQueryClient();

  // Fetch enrolled resource IDs from Supabase
  const { data: enrolledIds = [], isLoading: enrolledLoading } = useQuery({
    queryKey: ['enrolledResourceIds'],
    queryFn: resourcesEnrollmentService.getEnrolledResourceIds,
    staleTime: 30000,
  });

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: resourcesEnrollmentService.enroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolledResourceIds'] });
    },
  });

  // Unenroll mutation
  const unenrollMutation = useMutation({
    mutationFn: resourcesEnrollmentService.unenroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrolledResourceIds'] });
    },
  });

  const { data: resourcesData, isLoading, error, refetch } = useQuery({
    queryKey: ['skillResources'],
    queryFn: () => skillsService.getSkillResources(),
  });

  const handleEnroll = useCallback((courseId: string) => {
    enrollMutation.mutate(courseId);
  }, [enrollMutation]);

  const handleUnenroll = useCallback((courseId: string) => {
    unenrollMutation.mutate(courseId);
  }, [unenrollMutation]);

  const allResources = resourcesData?.data || [];

  const courses = allResources.filter(r => r.type === 'course');
  const webinars = allResources.filter(r => r.type === 'webinar');
  const articles = allResources.filter(r => r.type === 'article');
  const certifications = allResources.filter(r => r.type === 'certification');

  const sectionData: Record<string, any[]> = {
    courses,
    webinars,
    articles,
    certifications,
  };

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
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-lg font-medium text-foreground">Could not load resources</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            There was an error loading the resource hub. Please try again.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasAnyResources = allResources.length > 0;

  return (
    <div className="space-y-6">
      <SkillUpHeader />

      {!hasAnyResources ? (
        <div className="space-y-4">
          {sections.map((section) => (
            <FilteredEmptyState key={section.key} label={section.label} icon={section.icon} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => {
            const data = sectionData[section.key];
            const shouldShow = section.filters.includes(activeFilter);

            if (!shouldShow || data.length === 0) return null;

            const Icon = section.icon;

            return (
              <div key={section.key}>
                <div className="mb-4 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">{section.label}</h2>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {data.length} {data.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="space-y-3">
                  {section.key === "courses" &&
                    courses.map((course) => (
                      <CourseItem
                        key={course.id}
                        course={course}
                        enrolledCourses={enrolledIds}
                        handleEnroll={handleEnroll}
                        handleUnenroll={handleUnenroll}
                      />
                    ))}
                  {section.key === "webinars" &&
                    webinars.map((webinar) => (
                      <WebinarItem key={webinar.id} webinar={webinar} />
                    ))}
                  {section.key === "articles" &&
                    articles.map((article) => (
                      <ArticleItem key={article.id} article={article} />
                    ))}
                  {section.key === "certifications" &&
                    certifications.map((cert) => (
                      <CertificationItem key={cert.id} certification={cert} />
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProfessionalBodiesCard />
    </div>
  );
};

export default SkillUpFeed;

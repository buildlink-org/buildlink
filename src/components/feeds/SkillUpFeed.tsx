import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { skillsService } from "@/services/skillsService";
import { Card, CardContent } from "../ui/card";
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

  const { data: resourcesData, isLoading, error } = useQuery({
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
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500 text-center">Could not load resources. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SkillUpHeader />

      <div className="space-y-4">
        {(activeFilter === "courses" || activeFilter === "latest") && courses.length > 0 ? (
          courses.map((course) => (
            <CourseItem 
              key={course.id} 
              course={course}
              enrolledCourses={enrolledCourses}
              handleEnroll={handleEnroll}
            />
          ))
        ) : null}

        {(activeFilter === "webinars" || activeFilter === "latest") && webinars.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Webinars</h2>
            <div className="space-y-3">
              {webinars.map((webinar) => (
                <WebinarItem key={webinar.id} webinar={webinar} />
              ))}
            </div>
          </div>
        )}

        {(activeFilter === "articles" || activeFilter === "latest") && articles.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Featured Articles</h2>
            <div className="space-y-3">
              {articles.map((article) => (
                <ArticleItem key={article.id} article={article} />
              ))}
            </div>
          </div>
        )}

        {(activeFilter === "certifications" || activeFilter === "latest") && certifications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Professional Certifications</h2>
            <div className="space-y-3">
              {certifications.map((cert) => (
                <CertificationItem key={cert.id} certification={cert} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ProfessionalBodiesCard />
    </div>
  );
};

export default SkillUpFeed;

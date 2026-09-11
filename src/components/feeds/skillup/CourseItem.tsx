import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Users, Star, ChevronDown, ChevronUp, ExternalLink, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import ResourceReviewForm from "./ResourceReviewForm";
import ResourceReviewsList from "./ResourceReviewsList";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  provider: string;
  difficulty_level: string | null;
  description: string;
  duration: string | null;
  reviews_count: number | null;
  rating: number | null;
  syllabus: unknown[] | null;
  price: number | null;
  thumbnail?: string | null;
  link?: string | null;
}

interface CourseItemProps {
  course: Course;
  enrolledCourses: string[];
  handleEnroll: (courseId: string) => void;
  isEnrolling?: boolean;
}

const difficultyConfig: Record<string, { className: string; label: string }> = {
  beginner: {
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    label: "Beginner",
  },
  intermediate: {
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    label: "Intermediate",
  },
  advanced: {
    className: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    label: "Advanced",
  },
};

const CourseItem = ({ course, enrolledCourses, handleEnroll, isEnrolling }: CourseItemProps) => {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const enrolled = enrolledCourses.includes(course.id);
  const syllabus = Array.isArray(course.syllabus) ? (course.syllabus as string[]) : [];
  const price = course.price && course.price > 0 ? `KSh ${course.price.toLocaleString()}` : "Free";
  const diff = course.difficulty_level
    ? difficultyConfig[course.difficulty_level.toLowerCase()] ?? difficultyConfig.beginner
    : null;

  return (
    <Card
      className={cn(
        "border-0 shadow-sm transition-all duration-200",
        "hover:shadow-md hover:border-l-4 hover:border-l-primary",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <Play className="h-7 w-7 text-primary" aria-hidden />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                  {course.title}
                </h3>
                <p className="text-sm text-muted-foreground">{course.provider}</p>
              </div>
              {diff && (
                <Badge variant="outline" className={cn("shrink-0 text-xs capitalize", diff.className)}>
                  {diff.label}
                </Badge>
              )}
            </div>

            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>

            {/* Metadata row */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {course.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  {course.duration}
                </span>
              )}
              {course.rating != null && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" aria-hidden />
                  {course.rating.toFixed(1)}
                </span>
              )}
              {course.reviews_count != null && course.reviews_count > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden />
                  {course.reviews_count} {course.reviews_count === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>

            {/* Syllabus badges */}
            {syllabus.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1">
                {syllabus.slice(0, 3).map((module, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {module}
                  </Badge>
                ))}
                {syllabus.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{syllabus.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Actions row */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-base font-bold text-foreground">{price}</span>
              <div className="flex gap-2">
                {course.link && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={course.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View course materials"
                    >
                      <ExternalLink className="mr-1 h-4 w-4" />
                      Open
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={enrolled ? "secondary" : "default"}
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrolled || isEnrolling}
                  aria-label={enrolled ? "You are enrolled" : "Enroll in this course"}
                >
                  {enrolled ? (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      Enrolled
                    </>
                  ) : isEnrolling ? (
                    "Enrolling…"
                  ) : (
                    "Enroll Now"
                  )}
                </Button>
              </div>
            </div>

            {/* Reviews — collapsible */}
            <div className="mt-4 border-t border-border/50 pt-3">
              <Collapsible open={isReviewsOpen} onOpenChange={setIsReviewsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    aria-expanded={isReviewsOpen}
                  >
                    {isReviewsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {isReviewsOpen ? "Hide reviews" : "Show reviews"}
                    {course.reviews_count != null && course.reviews_count > 0 && (
                      <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                        {course.reviews_count}
                      </Badge>
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <ResourceReviewForm resourceId={course.id} />
                  <ResourceReviewsList resourceId={course.id} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseItem;

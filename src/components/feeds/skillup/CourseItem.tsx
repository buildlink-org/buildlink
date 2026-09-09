import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Users, Award, Download, Star, X } from "lucide-react";
import ResourceReviewForm from "./ResourceReviewForm";
import ResourceReviewsList from "./ResourceReviewsList";

interface Course {
  id: string;
  title: string;
  provider: string;
  difficulty_level: string;
  description: string;
  duration: string;
  reviews_count: number;
  rating: number;
  syllabus: string[];
  price: number | null;
}

interface CourseItemProps {
  course: Course;
  enrolledCourses: string[];
  handleEnroll: (courseId: string) => void;
  handleUnenroll?: (courseId: string) => void;
}

const CourseItem = ({ course, enrolledCourses, handleEnroll, handleUnenroll }: CourseItemProps) => {
  const isEnrolled = enrolledCourses.includes(course.id);
  return (
    <Card key={course.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-24 h-20 bg-muted rounded-lg flex items-center justify-center">
            <Play className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.provider}</p>
              </div>
              <Badge variant="outline" className={`text-xs capitalize ${
                course.difficulty_level === 'beginner' ? 'border-green-300 text-green-700 dark:text-green-400' :
                course.difficulty_level === 'intermediate' ? 'border-yellow-300 text-yellow-700 dark:text-yellow-400' :
                'border-red-300 text-red-700 dark:text-red-400'
              }`}>
                {course.difficulty_level}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
            
            <div className="flex items-center space-x-4 mb-3 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {course.duration}
              </div>
              <div className="flex items-center">
                <Award className="h-3 w-3 mr-1" />
                {course.reviews_count || 0} CPD Points
              </div>
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                {course.rating}
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {course.reviews_count || 0} students
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {(course.syllabus || []).slice(0, 3).map((module: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {module}
                </Badge>
              ))}
              {(course.syllabus || []).length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{(course.syllabus || []).length - 3} more
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">{course.price ? `KSh ${course.price}`: 'Free'}</span>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEnroll(course.id)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Syllabus
                </Button>
                {isEnrolled && handleUnenroll ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUnenroll(course.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Unenroll
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleEnroll(course.id)}
                    disabled={isEnrolled}
                  >
                    {isEnrolled ? "Enrolled" : "Enroll Now"}
                  </Button>
                )}
              </div>
            </div>
            {/* Show resource reviews */}
            <div className="mt-4">
              <ResourceReviewForm resourceId={course.id} />
              <ResourceReviewsList resourceId={course.id} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseItem;

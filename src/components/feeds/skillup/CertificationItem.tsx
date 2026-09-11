import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ExternalLink, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import ResourceReviewForm from "./ResourceReviewForm";
import ResourceReviewsList from "./ResourceReviewsList";
import { cn } from "@/lib/utils";

interface Certification {
  id: string;
  title: string;
  provider: string;
  description?: string | null;
  duration: string | null;
  price: number | null;
  link?: string | null;
}

interface CertificationItemProps {
  certification: Certification;
}

const CertificationItem = ({ certification }: CertificationItemProps) => {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const price = certification.price && certification.price > 0 ? `KSh ${certification.price.toLocaleString()}` : "Free";

  return (
    <Card className={cn(
      "group border-0 shadow-sm transition-all duration-200",
      "hover:shadow-md hover:border-l-4 hover:border-l-primary",
      "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Award className="h-8 w-8" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {certification.title}
              </h3>
              <p className="text-sm text-muted-foreground">{certification.provider}</p>
            </div>

            {certification.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{certification.description}</p>
            )}

            {certification.duration && (
              <div className="mt-2.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden />
                Duration: {certification.duration}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-base font-bold text-foreground">{price}</span>
              {certification.link ? (
                <Button
                  size="sm"
                  asChild
                  aria-label={`Apply for certification: ${certification.title}`}
                >
                  <a
                    href={certification.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Apply Now
                  </a>
                </Button>
              ) : (
                <Button size="sm" variant="secondary" disabled>
                  Coming Soon
                </Button>
              )}
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
                    {isReviewsOpen ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    {isReviewsOpen ? "Hide reviews" : "Show reviews"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <ResourceReviewForm resourceId={certification.id} />
                  <ResourceReviewsList resourceId={certification.id} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificationItem;

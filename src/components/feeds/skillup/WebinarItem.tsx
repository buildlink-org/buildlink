import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ExternalLink, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import ResourceReviewForm from "./ResourceReviewForm";
import ResourceReviewsList from "./ResourceReviewsList";
import { cn } from "@/lib/utils";

interface Webinar {
  id: string;
  title: string;
  provider: string;
  description?: string | null;
  link?: string | null;
  duration?: string | null;
  scheduled_at?: string | null;
}

interface WebinarItemProps {
  webinar: Webinar;
}

const WebinarItem = ({ webinar }: WebinarItemProps) => {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  return (
    <Card className={cn(
      "group border-0 shadow-sm transition-all duration-200",
      "hover:shadow-md hover:border-l-4 hover:border-l-primary",
      "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Video className="h-8 w-8" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {webinar.title}
              </h3>
              <p className="text-sm text-muted-foreground">{webinar.provider}</p>
            </div>

            {webinar.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{webinar.description}</p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {webinar.scheduled_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" aria-hidden />
                  {new Date(webinar.scheduled_at).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {webinar.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden />
                  {webinar.duration}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end">
              {webinar.link ? (
                <Button
                  size="sm"
                  asChild
                  aria-label={`Register for webinar: ${webinar.title}`}
                >
                  <a
                    href={webinar.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Register Now
                  </a>
                </Button>
              ) : (
                <Button size="sm" variant="secondary" disabled>
                  Registration Unavailable
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
                  <ResourceReviewForm resourceId={webinar.id} />
                  <ResourceReviewsList resourceId={webinar.id} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebinarItem;

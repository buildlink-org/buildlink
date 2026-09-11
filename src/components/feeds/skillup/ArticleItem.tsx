import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronDown, ChevronUp, Clock, Newspaper } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ResourceReviewForm from "./ResourceReviewForm";
import ResourceReviewsList from "./ResourceReviewsList";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  author?: string | null;
  provider?: string | null;
  category?: string | null;
  duration?: string | null;
  readTime?: string | null;
  description?: string | null;
  link?: string | null;
}

interface ArticleItemProps {
  article: Article;
}

const ArticleItem = ({ article }: ArticleItemProps) => {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const authorName = article.author || article.provider;
  const displayReadTime = article.duration || article.readTime;

  return (
    <Card className={cn(
      "group border-0 shadow-sm transition-all duration-200",
      "hover:shadow-md hover:border-l-4 hover:border-l-primary",
      "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Newspaper className="h-8 w-8" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              {authorName && <p className="text-sm text-muted-foreground mt-0.5">by {authorName}</p>}
            </div>

            {article.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.description}</p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {article.category && (
                <Badge variant="outline" className="text-xs capitalize">
                  {article.category}
                </Badge>
              )}
              {displayReadTime && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden />
                  {displayReadTime}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end">
              {article.link ? (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  aria-label={`Read article: ${article.title}`}
                >
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Read Article
                  </a>
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Link unavailable</span>
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
                  <ResourceReviewForm resourceId={article.id} />
                  <ResourceReviewsList resourceId={article.id} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleItem;

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ResourceReviewForm from "./ResourceReviewForm";
import ResourceReviewsList from "./ResourceReviewsList";

interface Article {
    id: string;
    title: string;
    author: string;
    category: string;
    readTime: string;
    link?: string;
}

interface ArticleItemProps {
    article: Article;
}

const ArticleItem = ({ article }: ArticleItemProps) => {
  return (
    <Card key={article.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <h3 className="font-medium text-foreground mb-2">{article.title}</h3>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>by {article.author}</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">{article.category}</Badge>
            <span>{article.readTime}</span>
            <Button size="sm" variant="ghost" asChild>
              <a href={article.link || "#"} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <ResourceReviewForm resourceId={article.id} />
          <ResourceReviewsList resourceId={article.id} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticleItem;

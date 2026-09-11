
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Usage: <ResourceReviewsList resourceId={resource.id} />

interface ResourceReviewsListProps {
  resourceId: string;
}

type Review = {
  id: string;
  user_id: string;
  content: string;
  rating: number;
  created_at: string;
  profiles?: {
    full_name?: string | null;
    avatar?: string | null;
  } | null;
};

export default function ResourceReviewsList({ resourceId }: ResourceReviewsListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["resource-reviews", resourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_reviews")
        .select("*, profiles!resource_reviews_user_id_fkey(full_name, avatar)")
        .eq("resource_id", resourceId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!resourceId,
  });

  if (isLoading) {
    return (
      <div className="space-y-3" aria-live="polite">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load reviews. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0)
    return <p className="text-sm text-muted-foreground italic">No reviews yet. Be the first!</p>;

  const formatDateSafe = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return "Some time ago";
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return "Some time ago";
    }
  };

  const getStars = (n: number) => {
    return "★".repeat(n) + "☆".repeat(5 - n);
    const validStars = Math.max(0, Math.min(5, Math.round(n || 0)));
    return "★".repeat(validStars) + "☆".repeat(5 - validStars);
  };

  return (
    <div className="space-y-4 mt-2">
      {data.map(review => (
        <div
          key={review.id}
          className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-yellow-400" aria-label={`Rating: ${review.rating} out of 5 stars`}>
              {getStars(review.rating)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDateSafe(review.created_at)}
            </span>
          </div>
          <div className="text-sm text-foreground">{review.content}</div>
        </div>
      ))}
    </div>
  );
}

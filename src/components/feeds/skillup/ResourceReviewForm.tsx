
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Usage: <ResourceReviewForm resourceId={resource.id} />
interface ResourceReviewFormProps {
  resourceId: string;
}

export default function ResourceReviewForm({ resourceId }: ResourceReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("resource_reviews").insert([
        {
          resource_id: resourceId,
          user_id: user?.id,
          rating,
          content,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      setRating(0);
      setHoverRating(0);
      queryClient.invalidateQueries({ queryKey: ["resource-reviews", resourceId] });
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Review failed",
        description: "Could not submit your review. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const starValue = hoverRating || rating;

  return (
    <form
      className="my-4 space-y-3"
      onSubmit={e => {
        e.preventDefault();
        if (rating === 0 || !content.trim()) return;
        mutation.mutate();
      }}
    >
      <div className="space-y-1">
        <label
          htmlFor={`rating-${resourceId}`}
          className="text-sm font-medium text-foreground"
        >
          Your rating
        </label>
        <div
          className="flex items-center gap-1"
          role="radiogroup"
          aria-labelledby={`rating-label-${resourceId}`}
        >
          <span id={`rating-label-${resourceId}`} className="sr-only">
            Select your star rating
          </span>
          {[1, 2, 3, 4, 5].map(val => (
            <button
              key={val}
              type="button"
              id={val === 1 ? `rating-${resourceId}` : undefined}
              aria-label={`${val} star${val > 1 ? "s" : ""}`}
              aria-checked={rating === val}
              role="radio"
              onClick={() => setRating(val)}
              onMouseEnter={() => setHoverRating(val)}
              onMouseLeave={() => setHoverRating(0)}
              className={cn(
                "p-0.5 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                starValue >= val
                  ? "text-yellow-400"
                  : "text-muted-foreground/30 hover:text-muted-foreground"
              )}
            >
              <Star className="h-5 w-5 fill-current" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <Textarea
        id={`review-content-${resourceId}`}
        placeholder="Write your review here..."
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full"
        minLength={2}
        maxLength={500}
        rows={3}
        required
        aria-label="Review content"
      />

      <Button
        type="submit"
        disabled={mutation.isPending || rating === 0 || !content.trim()}
        aria-busy={mutation.isPending}
      >
        {mutation.isPending ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}

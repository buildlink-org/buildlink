import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ratedUserId: string;
  ratedUserName: string;
  projectId?: string;
}

const RatingDialog = ({ isOpen, onClose, ratedUserId, ratedUserName, projectId }: RatingDialogProps) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    workQuality: 0,
    communication: 0,
    timeliness: 0,
    professionalism: 0
  });
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (rating: number) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (ratings.overall === 0) {
      toast({
        title: 'Rating required',
        description: 'Please provide an overall rating.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_ratings')
        .insert({
          rated_user_id: ratedUserId,
          project_id: projectId,
          rating: ratings.overall,
          work_quality_rating: ratings.workQuality || null,
          communication_rating: ratings.communication || null,
          timeliness_rating: ratings.timeliness || null,
          professionalism_rating: ratings.professionalism || null,
          review_text: reviewText || null,
        });

      if (error) throw error;

      toast({
        title: 'Rating submitted',
        description: `Your rating for ${ratedUserName} has been submitted successfully.`,
      });

      // Reset form
      setRatings({
        overall: 0,
        workQuality: 0,
        communication: 0,
        timeliness: 0,
        professionalism: 0
      });
      setReviewText('');
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error submitting rating',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        description={`Rate ${ratedUserName} on work quality, communication, timeliness, and professionalism`}>
        <DialogHeader>
          <DialogTitle>Rate {ratedUserName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <StarRating
            value={ratings.overall}
            onChange={(rating) => setRatings({ ...ratings, overall: rating })}
            label="Overall Rating *"
          />
          
          <StarRating
            value={ratings.workQuality}
            onChange={(rating) => setRatings({ ...ratings, workQuality: rating })}
            label="Work Quality"
          />
          
          <StarRating
            value={ratings.communication}
            onChange={(rating) => setRatings({ ...ratings, communication: rating })}
            label="Communication"
          />
          
          <StarRating
            value={ratings.timeliness}
            onChange={(rating) => setRatings({ ...ratings, timeliness: rating })}
            label="Timeliness"
          />
          
          <StarRating
            value={ratings.professionalism}
            onChange={(rating) => setRatings({ ...ratings, professionalism: rating })}
            label="Professionalism"
          />

          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your experience working with this user..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
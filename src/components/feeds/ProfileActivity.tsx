
import { Card, CardContent } from "../ui/card";
import { MessageSquare, Edit, Heart, Share2 } from "lucide-react";

interface ProfileActivityProps {
  userPosts: any[];
  noCard?: boolean;
}

const ProfileActivity = ({ userPosts, noCard = false }: ProfileActivityProps) => {
  const renderActivityItem = (post: any) => (
    <div key={post.id} className="border-b border-border pb-4 mb-4 last:border-b-0">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Edit className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-foreground mb-2">{post.content}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{post.likes_count || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments_count || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share2 className="h-4 w-4" />
                <span>{post.reposts_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const activityContent = (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <span className="text-sm text-muted-foreground">{userPosts.length} posts</span>
      </div>
      <div className="flex-1">
        {userPosts.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-4">
              {userPosts.slice(0, 5).map(renderActivityItem)}
            </div>
            
            {userPosts.length > 5 && (
              <div className="pt-4 border-t border-border text-center">
                <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                  View all {userPosts.length} posts →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 flex-1 flex flex-col justify-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground">
              Start sharing your thoughts and experiences with the community
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (noCard) {
    return activityContent;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="border-0 shadow-sm h-full flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          {activityContent}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileActivity;


import { Card, CardContent } from "../ui/card";
import { MessageSquare, Edit, Heart, Share2, FileText } from "lucide-react";
import { parsePostImages } from "@/lib/uploadUtils";
import { getFilenameFromUrl } from "@/lib/utils";

interface ProfileActivityProps {
  userPosts: any[];
  noCard?: boolean;
}

const ProfileActivity = ({ userPosts, noCard = false }: ProfileActivityProps) => {
  const renderActivityItem = (post: any) => {
    const postImages = parsePostImages(post.image_url);

    return (
      <div key={post.id} className="border-b border-border pb-4 mb-4 last:border-b-0">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 mt-0.5">
            <Edit className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground mb-2 whitespace-pre-wrap">{post.content}</p>

            {/* Render Post Images */}
            {postImages.length > 0 && (
              <div className="mb-3 overflow-hidden rounded-lg border bg-muted/30">
                {postImages.length === 1 ? (
                  <img
                    src={postImages[0]}
                    alt="Post media"
                    className="max-h-64 w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 p-1">
                    {postImages.slice(0, 4).map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative aspect-video overflow-hidden rounded-md border">
                        <img src={imgUrl} alt={`Post media ${idx + 1}`} className="h-full w-full object-cover" />
                        {idx === 3 && postImages.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-bold">
                            +{postImages.length - 4} more
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Render PDF Document Attachment */}
            {post.document_url && (
              <div className="mb-3 flex items-center space-x-3 rounded-lg border bg-slate-50 dark:bg-slate-900/50 p-3 text-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded bg-red-500/10 text-red-500 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">
                    {post.document_name || getFilenameFromUrl(post.document_url) || "Attached PDF Document"}
                  </p>
                  <span className="text-[10px] text-muted-foreground uppercase">PDF Document</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Heart className="h-3.5 w-3.5" />
                  <span>{post.likes_count || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{post.comments_count || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{post.reposts_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

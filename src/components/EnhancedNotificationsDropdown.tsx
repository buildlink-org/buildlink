import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Bell,
  Check,
  User,
  MessageCircle,
  Briefcase,
  BookOpen,
  Heart,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import {
  NotificationService,
  groupNotifications,
  getNotificationCategory,
} from "@/services/notificationService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useMessagingStore } from "@/stores/messagingStore";
import { useCommentsStore } from "@/stores/commentsStore";

const notificationCategories = [
  { id: "all", label: "All", icon: Bell },
  { id: "posts", label: "Posts", icon: MessageCircle },
  { id: "connections", label: "Connections", icon: User },
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "training", label: "Training", icon: BookOpen },
];

const EnhancedNotificationsDropdown = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isOpen, setIsOpen] = useState(false);

  const openConversation = useMessagingStore((state) => state.openConversation);
  const openComments = useCommentsStore.getState().openComments;

  const typeIcons: Record<string, JSX.Element> = {
    message: <MessageSquare className="h-5 w-5 text-primary" />,
    comment: <MessageCircle className="h-5 w-5 text-primary" />,
    like: <Heart className="h-5 w-5 text-primary" />,
    mention: <MessageSquare className="h-5 w-5 text-primary" />,
    connection: <UserPlus className="h-5 w-5 text-primary" />,
    job: <Briefcase className="h-5 w-5 text-primary" />,
    training: <BookOpen className="h-5 w-5 text-primary" />,
  };

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } =
        await NotificationService.getNotificationsPaginated(user.id, 20, 0);
      if (error) return;

      const normalized = (data || []).map((n) => ({
        ...n,
        category: getNotificationCategory(n),
      }));

      setNotifications(normalized);
      setUnreadCount(normalized.filter((n) => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadNotifications]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-dropdown")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const rawNotification = payload.new as any;
          const hydrated = await NotificationService.hydrateNotification(rawNotification);

          setNotifications((prev) => [hydrated, ...prev]);
          if (!hydrated.read) {
            setUnreadCount((prev) => prev + 1);
          }

          toast({
            title: "New Notification",
            description: hydrated.content,
          });

          NotificationService.sendBrowserPushNotification("BuildLink Notification", {
            body: hydrated.content,
            tag: hydrated.id,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const markAsRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await NotificationService.markAllAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const filteredNotifications = notifications
    .filter((n) => {
      if (activeCategory === "all") return true;
      return getNotificationCategory(n) === activeCategory;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  const groupedNotifications = useMemo(
    () => groupNotifications(filteredNotifications),
    [filteredNotifications],
  );

  const handleNotificationClick = async (n: any) => {
    if (!n.read) await markAsRead(n.id);

    const postId = n.post_id || n.entity_id || n.target_id || n.data?.post_id || n.data?.entity_id;
    const userId = n.from_user?.id || n.user_id;

    switch (n.type) {
      case "connection":
      case "follow":
      case "profile":
        if (userId) navigate(`/profile/${userId}`);
        else navigate(`/profile`);
        break;

      case "message":
        openConversation(
          n.from_user?.id,
          n.from_user?.full_name,
          n.from_user?.avatar,
        );
        break;

      case "comment":
      case "like":
      case "mention":
      case "post":
        if (postId) {
          openComments(postId);
        }
        navigate(`/feed`);
        break;

      case "job":
      case "training":
        navigate(`/resource-hub`);
        break;

      default:
        if (postId) {
          openComments(postId);
        }
        navigate(`/feed`);
    }

    setIsOpen(false);
  };

  if (!user) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-0 -top-[0.9px] mx-0 flex h-4 w-4 items-center justify-center p-0 text-center text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Tabs with icons + labels */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {notificationCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="flex items-center gap-1 text-xs">
                  <Icon className="h-3 w-3" />
                  <span>{cat.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Notifications */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : groupedNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              groupedNotifications.map((n) => {
                const name = n.from_user?.full_name
                  ? n.from_user.full_name
                  : "User";

                const contentStartsWithName = n.content
                  ?.toLowerCase()
                  .startsWith(name.toLowerCase());

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex justify-between p-4 border-b cursor-pointer hover:bg-accent/50 transition-colors ${
                      !n.read ? "bg-accent/30 font-medium" : ""
                    }`}>
                    <div className="flex gap-2">
                      {/* Icon */}
                      <div className="mt-0.5">{typeIcons[n.type] || <Bell className="h-5 w-5 text-primary" />}</div>

                      {/* Avatar */}
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={n.from_user?.avatar} />
                        <AvatarFallback>{name[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div>
                        <p className="text-sm">
                          {!contentStartsWithName && (
                            <strong className="mr-1">{name}</strong>
                          )}
                          {n.content}
                          {n.groupCount && n.groupCount > 1 && (
                            <span className="ml-1 text-xs text-muted-foreground font-normal">
                              (+{n.groupCount - 1} more)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(n.created_at).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedNotificationsDropdown;


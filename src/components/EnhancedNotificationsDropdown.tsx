import { useState, useEffect } from 'react';
import { Bell, Check, Filter, User, MessageCircle, Briefcase, BookOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsService } from '@/services/notificationsService';
import { useToast } from '@/hooks/use-toast';
import { useNotificationsStore } from '@/stores/notificationStore';

const notificationCategories = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'follows', label: 'Follows', icon: User },
  { id: 'comments', label: 'Comments', icon: MessageCircle },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'training', label: 'Training', icon: BookOpen },
];

const EnhancedNotificationsDropdown = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isOpen, setIsOpen] = useState(false);

  const notification = useNotificationsStore((state) => state.notifications)
  const unreadCounts = useNotificationsStore((state) => state.unreadCount)

  console.log("Current notifications:", notification) // 🔥
  console.log("Current unread count:", unreadCounts)

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Set up real-time subscription for notifications
      const interval = setInterval(loadNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await notificationsService.getNotifications(user.id);
      
      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await notificationsService.markAsRead(notificationId);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to mark notification as read",
          variant: "destructive"
        });
        return;
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await notificationsService.markAllAsRead(user.id);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to mark all notifications as read",
          variant: "destructive"
        });
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeCategory === 'all') return true;
    return notification.type === activeCategory;
  });

  const getCategoryUnreadCount = (category: string) => {
    if (category === 'all') return unreadCount;
    return notifications.filter(n => !n.read && n.type === category).length;
  };

  if (!user) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-6"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-9">
            {notificationCategories.map((category) => {
              const Icon = category.icon;
              const categoryUnreadCount = getCategoryUnreadCount(category.id);
              
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="relative text-xs px-2 py-1"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">{category.label}</span>
                  {categoryUnreadCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs p-0"
                    >
                      {categoryUnreadCount > 9 ? '9+' : categoryUnreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No {activeCategory !== 'all' ? activeCategory : ''} notifications yet
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
                    !notification.read ? 'bg-accent/30' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    {notification.from_user && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={notification.from_user.avatar} />
                        <AvatarFallback>
                          {notification.from_user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        {notification.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedNotificationsDropdown;
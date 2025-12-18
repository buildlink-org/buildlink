import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Minimize2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ConversationsList from './ConversationList';
import ConversationView from './ConversationView';
import { useMessagingStore } from '@/stores/messagingStore';

interface UserListItem {
  id: string;
  name?: string;
  avatar?: string;
}
interface FloatingMessagingWidgetProps {
  count: number;
}

const FloatingMessagingWidget: React.FC<FloatingMessagingWidgetProps> = ({ count }) => {
   const recipientId = useMessagingStore((state) => state.recipientId);
  const recipientName = useMessagingStore((state) => state.recipientName);
  const recipientAvatar = useMessagingStore((state) => state.recipientAvatar);
  const clearRecipient = useMessagingStore((state) => state.clearRecipient);

  const [isOpen, setIsOpen] = useState(!!recipientId);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  useEffect(() => {
    if (recipientId) {
      setIsOpen(true);
      setIsMinimized(false);
      setSelectedUser({
        id: recipientId,
        name: recipientName || undefined,
        avatar: recipientAvatar || undefined,
      });
    }
  }, [recipientId, recipientName, recipientAvatar]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedUser(null);
    clearRecipient();
  };

  const handleSelectUser = (user: UserListItem) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
    clearRecipient();
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 max-sm:bottom-10 right-4 max-sm:right-2 z-50 h-14 w-14 max-sm:h-10 max-sm:w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform duration-600 ease-in flex items-center justify-center"
        >
          <MessageSquare className="h-6 w-6 max-sm:h-5 max-sm:w-5" />
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-red-500">
              {count}
            </Badge>
          )}
        </button>
      )}

      {/* Messaging Window */}
      {isOpen && (
        <div
          className={`fixed bottom-0 right-2 z-50 bg-white rounded-t-lg shadow-2xl border border-border transition-all duration-300 ${
            isMinimized ? 'h-10 w-60' : 'h-[600px] w-[300px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between py-2 px-3 border-b bg-card">
            <div className="flex items-center gap-2">
              {selectedUser && !isMinimized && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -ml-2"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <MessageSquare className="h-4 w-4" />
              <h3 className="font-semibold text-sm">
                {selectedUser ? selectedUser.name || 'Chat' : 'Inbox'}
              </h3>
              {count > 0 && !selectedUser && (
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          {!isMinimized && (
            <div className="h-[calc(600px-56px)] overflow-hidden">
              {selectedUser ? (
                <ConversationView
                  otherUserId={selectedUser.id}
                  otherUserName={selectedUser.name}
                  otherUserAvatar={selectedUser.avatar}
                />
              ) : (
                <ConversationsList onSelectUser={handleSelectUser} />
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingMessagingWidget;
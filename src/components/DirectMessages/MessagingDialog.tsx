import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import ConversationView from './ConversationView';
import ConversationsList from './ConversationList';

interface MessagingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRecipientId?: string;
  initialRecipientName?: string;
  initialRecipientAvatar?: string;
}

export const MessagingDialog: React.FC<MessagingDialogProps> = ({
  open,
  onOpenChange,
  initialRecipientId,
  initialRecipientName,
  initialRecipientAvatar,
}) => {
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name?: string;
    avatar?: string;
  } | null>(
    initialRecipientId
      ? {
          id: initialRecipientId,
          name: initialRecipientName,
          avatar: initialRecipientAvatar,
        }
      : null
  );

  // Reset when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedUser(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            {selectedUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="mr-2 -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <MessageSquare className="h-5 w-5" />
            {selectedUser ? selectedUser.name || 'Conversation' : 'Messages'}
          </DialogTitle>
          <DialogDescription>
            {selectedUser
              ? 'Send a message to start the conversation'
              : 'Your direct message conversations'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {selectedUser ? (
            <ConversationView
              otherUserId={selectedUser.id}
              otherUserName={selectedUser.name}
              otherUserAvatar={selectedUser.avatar}
            />
          ) : (
            <ConversationsList onSelectUser={setSelectedUser} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
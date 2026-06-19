
import React, { useEffect, useState } from "react";
import Conversation from "./Conversation";
import { directMessagesService } from "@/services/directMessagesService";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  full_name?: string;
  avatar?: string;
}

interface UserListItem {
  id: string;
  name?: string;
  avatar?: string;
}

const Inbox = () => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await directMessagesService.getConversations(user.id);
      if (error) {
        setUsers([]);
        setLoading(false);
        return;
      }
      // The data should be an array of user IDs (other user in the conversation)
      if (!data || !Array.isArray(data)) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Fetch profile info for each user
      const promises = data.map(async (c: any) => {
        // The .other_user_id from the RPC
        const otherUserId = c.other_user_id || c.user_id || c.id || c;
        if (!otherUserId || otherUserId === user.id) return null;
        try {
          const { data: profile, error } = await profileService.getProfile(otherUserId);
          if (profile) {
            return {
              id: otherUserId,
              name: profile.full_name,
              avatar: profile.avatar,
            };
          }
        } catch (e) {
          // ignore error
        }
        return {
          id: otherUserId,
          name: "Unknown User",
          avatar: undefined,
        };
      });
      const results = await Promise.all(promises);
      setUsers(results.filter(Boolean) as UserListItem[]);
      setLoading(false);
    };
    fetchConversations();
  }, [user]);

  if (selectedUser) {
    return <Conversation otherUserId={selectedUser.id} otherUserName={selectedUser.name} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow border p-4 h-[60vh]">
      <h2 className="font-bold text-primary text-xl mb-4">Direct Messages</h2>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-gray-500">No messages yet.</div>
      ) : (
        <ul className="divide-y">
          {users.map((user) => (
            <li key={user.id} className="py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar} alt={user.name}/>
                  <AvatarFallback>
                    {user.name?.split(" ").map((n) => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.name}</span>
              </div>
              <button
                className="text-sm text-blue-600 underline"
                onClick={() => setSelectedUser(user)}
              >
                Open
              </button>
            </li>
          ))}5y
        </ul>
      )}
    </div>
  );
};

export default Inbox;
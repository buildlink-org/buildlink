import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { publicProfileService } from "@/services/publicProfileService";
import { postsService } from "@/services/postsService";
import { useToast } from "@/hooks/use-toast";
import { useStableState } from "@/hooks/useStableState";
import { UserProfile } from "@/types";

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { stableCallback } = useStableState();
  const [profile, setProfile] = useState<UserProfile>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadUserData = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Use Promise.all for concurrent requests
      const [profileResult, postsResult] = await Promise.all([
        profileService.getProfile(user.id),
        postsService.getPosts()
      ]);

      if (profileResult.error) {
        console.error('Profile error:', profileResult.error);
      } else {
        setProfile(profileResult.data);
      }

      if (postsResult.error) {
        console.error('Posts error:', postsResult.error);
      } else {
        const filteredPosts = postsResult.data?.filter(post => post.author_id === user.id) || [];
        setUserPosts(filteredPosts);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      if (forceRefresh) {
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  const handleProfileUpdate = stableCallback(() => {
    loadUserData(true);
    // Update profile completion score
    if (user) {
      publicProfileService.updateProfileCompletion(user.id);
    }
    toast({
      title: 'Success',
      description: 'Profile updated successfully!'
    });
  }, [user]);

  const handleAvatarChange = stableCallback(async (croppedFile: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const { data, error } = await profileService.uploadAvatar(user.id, croppedFile);
      if (error) throw error;
      if (data) {
        setProfile((prev: any) => ({ ...prev, avatar: data.avatar || "" }));
        toast({
          title: "Success",
          description: "Avatar uploaded successfully!",
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [user]);

  const handleAvatarRemove = stableCallback(async () => {
    if (!user) return;
    setUploading(true);
    try {
      const updatedProfile = { ...profile, avatar: "" };
      const { error } = await profileService.updateProfile(user.id, updatedProfile);
      if (error) throw error;
      setProfile(updatedProfile);
      toast({
        title: "Photo removed",
        description: "Your profile photo has been removed.",
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Error",
        description: "Failed to remove profile photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [user, profile]);

  return {
    profile,
    userPosts,
    loading,
    uploading,
    handleProfileUpdate,
    handleAvatarChange,
    handleAvatarRemove,
    loadUserData: () => loadUserData(true), // Expose force refresh
  };
};

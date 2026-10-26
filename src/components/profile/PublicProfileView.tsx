import React, { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { publicProfileService } from "@/services/publicProfileService"
import { useToast } from "@/hooks/use-toast"
import { UserProfile } from "@/types"
import { connectionsService } from "@/services/connectionsService"
import { postsService } from "@/services/postsService"
import { useMessagingStore } from "@/stores/messagingStore"

import AccountTypeBadge from "../AccountTypeBadge"
import AboutActivitySection from "../profile-sections/details/AboutActivitySection"
import CertificationsSection from "../profile-sections/details/CertificationsSection"
import EducationSection from "../profile-sections/details/EducationSection"
import ExperienceSection from "../profile-sections/details/ExperienceSection"
import PortfolioSection from "../profile-sections/details/PortfolioSection"
import ProfileSkillsSection from "../profile-sections/details/ProfileSkillsSection"
import LanguagesSection from "../profile-sections/details/LanguagesSection"
import SocialMediaLinks from "./SocialMediaLinks"
import CompanyProfileSections from "./CompanyProfileSections"
import SuggestedConnections from "./SuggestedConnections"
import { getProfileSubtitle } from "@/lib/profileDisplay"

type ConnectionStatus =
   | "not_connected"
   | "pending_outgoing"
   | "pending_incoming"
   | "connected"
   | "self"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PublicProfileView: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>()
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionRow, setConnectionRow] = useState<any | null>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("not_connected")
  const [userPosts, setUserPosts] = useState<any[]>([])

  const openConversation = useMessagingStore((state) => state.openConversation)

  const isOwner = user?.id === profileId
  const isCompanyProfile = profile?.user_type === "company"

  // LOAD PROFILE
  const loadPublicProfile = useCallback(async () => {
    if (!profileId) return
    setLoading(true)
    try {
      const { data, error } =
        await publicProfileService.getPublicProfile(profileId, user?.id)
      if (error || !data) throw error
      setProfile(data)

      const postsResult = await postsService.getPosts()
      if (postsResult.data) {
        setUserPosts(
          postsResult.data.filter((post: any) => post.author_id === profileId)
        )
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [profileId, user, toast])

  const refreshConnectionStatus = useCallback(async () => {
    if (!user?.id || !profileId) return

    if (user.id === profileId) {
      setConnectionStatus("self")
      return
    }

    const { data } = await connectionsService.getConnectionStatus(
      user.id,
      profileId
    )

    if (!data) {
      setConnectionRow(null)
      setConnectionStatus("not_connected")
      return
    }

    setConnectionRow(data)

    if (data.status === "accepted") {
      setConnectionStatus("connected")
      return
    }

    if (data.status === "pending") {
      if (data.user_id === user.id) {
        setConnectionStatus("pending_outgoing")
      } else {
        setConnectionStatus("pending_incoming")
      }
      return
  }

  setConnectionStatus("not_connected")
  }, [user, profileId])

  useEffect(() => {
    loadPublicProfile()
  }, [loadPublicProfile])

  // CONNECTION STATUS
  useEffect(() => {
    refreshConnectionStatus()
  }, [refreshConnectionStatus])

  useEffect(() => {
  if (!profileId || isOwner) return

  publicProfileService.recordProfileView(profileId)
}, [profileId, isOwner])

  // ACTIONS
const handleConnect = async () => {
  if (!user?.id || !profileId) return;

  const { error } = await connectionsService.connect(
    user.id,
    profileId,
    isCompanyProfile
  );

  if (error) {
    toast({
      title: "Error",
      description: isCompanyProfile
        ? "Unable to follow."
        : "Unable to send connection request.",
      variant: "destructive",
    });
    return;
  }

  // Refresh directly from database
  await refreshConnectionStatus();

  toast({
    title: isCompanyProfile ? "Following" : "Request Sent",
    description: isCompanyProfile
      ? `You're now following ${profile?.full_name}.`
      : `Connection request sent to ${profile?.full_name}.`,
  });
};

const handleAccept = async () => {
  if (!connectionRow?.id) return

  const { error } = await connectionsService.acceptRequest(connectionRow.id)

  if (error) {
    toast({
      title: "Error",
      description: "Unable to accept request.",
      variant: "destructive",
    })
    return
  }

  await refreshConnectionStatus()

  toast({
    title: "Connected",
    description: `You are now connected with ${profile?.full_name}.`,
  })
}

const handleCancelRequest = async () => {
  if (!connectionRow?.id) return;

  const { error } = await connectionsService.removeConnection(
    connectionRow.id
  );

  if (error) {
    toast({
      title: "Error",
      description: "Unable to cancel request.",
      variant: "destructive",
    });
    return;
  }

  await refreshConnectionStatus();

  toast({
    title: "Request Cancelled",
    description: "Your connection request has been cancelled.",
  });
};

  

  

const handleDisconnect = async () => {
  if (!connectionRow?.id) return;

  const { error } = await connectionsService.removeConnection(
    connectionRow.id
  );

  if (error) {
    toast({
      title: "Error",
      description: "Failed to update connection.",
      variant: "destructive",
    });
    return;
  }

  // Refresh directly from database
  await refreshConnectionStatus();

  toast({
    title: "Success",
    description: isCompanyProfile
      ? `Stopped following ${profile?.full_name}.`
      : `Disconnected from ${profile?.full_name}.`,
  });
};

  // BUTTONS
const renderButtons = () => {
  if (!user || connectionStatus === "self") return null;

  const messageBtn = (
    <Button
      variant="outline"
      disabled={connectionStatus !== "connected"}
      onClick={() =>
        openConversation?.(
          profileId!,
          profile?.full_name,
          profile?.avatar
        )
      }
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      Message
    </Button>
  );

  // Company profiles
  if (isCompanyProfile) {
    if (connectionStatus === "connected") {
      return (
        <>
          <Button variant="outline" onClick={handleDisconnect}>
            Following
          </Button>
          {messageBtn}
        </>
      );
    }

    return (
      <>
        <Button variant="outline" className="border-black text-black" onClick={handleConnect}>
          Follow
        </Button>
        {messageBtn}
      </>
    );
  }

  // Normal users
  switch (connectionStatus) {
    case "connected":
      return (
        <>
          <Button variant="outline" onClick={handleDisconnect}>
            Connected
          </Button>
          {messageBtn}
        </>
      );

    case "pending_outgoing":
      return (
        <>
          <Button
            variant="outline"
            onClick={handleCancelRequest}
          >
            Cancel Request
          </Button>
        </>
      );

    case "pending_incoming":
      return (
        <>
          <Button onClick={handleAccept}>
            Accept
          </Button>

          <Button
            variant="outline"
            onClick={handleCancelRequest}
          >
            Decline
          </Button> 
        </>
      );

    default:
      return (
        <>
          <Button variant="outline" className="border-black text-black" onClick={handleConnect}>
            Connect
          </Button>
        </>
      );
  }
};

  // UI — loading
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (!profile) return null

  const displayName = profile.user_type === "company"
    ? profile.organization || profile.full_name
    : profile.full_name
  const subtitle = getProfileSubtitle(profile)
  const professions = Array.isArray(profile.profession)
    ? profile.profession
    : profile.profession
      ? [profile.profession]
      : []

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-2 sm:px-4">

      {/* ── PROFILE BANNER ─────────────────────────────────────────────── */}
      <Card className={isCompanyProfile ? "border-company-200 bg-company-50 dark:border-company-800 dark:bg-company-950/30" : profile.user_type === "professional" ? "border-professional-200 bg-professional-50 dark:border-professional-800 dark:bg-professional-950/30" : "border-student-200 bg-student-50 dark:border-student-800 dark:bg-student-950/30"}>
        <CardContent className="py-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={profile.avatar || undefined} />
                <AvatarFallback>{displayName?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold leading-tight">{displayName}</h1>
                <AccountTypeBadge userType={profile.user_type || "student"} />
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              {!isOwner && renderButtons()}
              <Dialog>
                <DialogTrigger asChild><Button variant="outline">Social Links</Button></DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader><DialogTitle>Social Links</DialogTitle></DialogHeader>
                  <SocialMediaLinks links={profile.social_links || {}} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
      <AboutActivitySection
        publicProfile
        profile={profile}
        userPosts={userPosts}
      />
      <ProfileSkillsSection profile={profile} />
      <PortfolioSection profile={profile} maxItems={3} />
      {isCompanyProfile ? (
        <CompanyProfileSections profile={profile} />
      ) : (
        <>
          <ExperienceSection profile={profile} />
          <EducationSection profile={profile} />
          <CertificationsSection profile={profile} />
          <LanguagesSection profile={profile} handleProfileUpdate={() => {}} />
        </>
      )}
      <SuggestedConnections profileId={profile.id} myProfessions={professions} showEmpty />
    </div>
  )
}

export default PublicProfileView
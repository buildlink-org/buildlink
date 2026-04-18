import React, { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, UserPlus, Pencil } from "lucide-react"
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
import SocialMediaLinks from "./SocialMediaLinks"

type ConnectionStatus =
  | "not_connected"
  | "pending_outgoing"
  | "pending_incoming"
  | "connected"
  | "self"

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

  const openConversation = useMessagingStore(
    (state) => state.openConversation
  )

  const isOwner = user?.id === profileId
  const isCompanyProfile = profile?.user_type === "company"
  const connectLabel = isCompanyProfile ? "Follow" : "Connect"

 
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
          postsResult.data.filter(
            (post: any) => post.author_id === profileId
          )
        )
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [profileId, user, toast])

  useEffect(() => {
    loadPublicProfile()
  }, [loadPublicProfile])

  
  // CONNECTION STATUS
  
  useEffect(() => {
    const fetchConnectionStatus = async () => {
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
        setConnectionStatus("not_connected")
        return
      }

      setConnectionRow(data)

      if (data.status === "accepted") {
        setConnectionStatus("connected")
      } else if (data.status === "pending") {
        setConnectionStatus(
          data.user_id === user.id
            ? "pending_outgoing"
            : "pending_incoming"
        )
      }
    }

    fetchConnectionStatus()
  }, [user, profileId])

  // ACTIONS
  const handleConnect = async () => {
    if (!user?.id || !profileId) return

    const { data, error } = await connectionsService.connect(
      user.id,
      profileId
    )

    if (error) {
      toast({
        title: "Error",
        description: "Failed to connect",
        variant: "destructive",
      })
      return
    }

    setConnectionRow(data)
    setConnectionStatus("pending_outgoing")

    toast({
      title: "Success",
      description: "Connection request sent",
    })
  }

  const handleAccept = async () => {
    if (!connectionRow?.id) return

    const { error } = await connectionsService.acceptRequest(
      connectionRow.id
    )

    if (error) return

    setConnectionStatus("connected")

    toast({
      title: "Connected",
      description: `You are now connected with ${profile?.full_name}`,
    })
  }

  const handleCancelOrDecline = async () => {
    if (!connectionRow?.id) return

    try {
      const { error } = await connectionsService.removeConnection(
        connectionRow.id
      )

      if (error) throw error

      setConnectionRow(null)
      setConnectionStatus("not_connected")

      toast({
        title: "Success",
        description:
          connectionStatus === "pending_outgoing"
            ? "Request cancelled"
            : "Request declined",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update connection",
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = async () => {
    if (!connectionRow?.id) return

    const confirmed = window.confirm(
      isCompanyProfile
        ? `Are you sure you want to unfollow ${profile?.full_name}?`
        : `Are you sure you want to disconnect from ${profile?.full_name}?`
    )

    if (!confirmed) return

    try {
      const { error } = await connectionsService.removeConnection(
        connectionRow.id
      )

      if (error) throw error

      setConnectionRow(null)
      setConnectionStatus("not_connected")

      toast({
        title: "Success",
        description: isCompanyProfile
          ? "Unfollowed successfully"
          : "Disconnected successfully",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update connection",
        variant: "destructive",
      })
    }
  }


  // BUTTONS
  const renderButtons = () => {
    if (!user || connectionStatus === "self") return null

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
    )

    if (connectionStatus === "connected") {
      return (
        <>
          <Button variant="outline" onClick={handleDisconnect}>
            {isCompanyProfile ? "Following" : "Connected"}
          </Button>
          {messageBtn}
        </>
      )
    }

    if (connectionStatus === "pending_outgoing") {
      return (
        <>
          <Button variant="outline" onClick={handleCancelOrDecline}>
            Cancel Request
          </Button>
          {messageBtn}
        </>
      )
    }

    if (connectionStatus === "pending_incoming") {
      return (
        <>
          <Button onClick={handleAccept}>Accept</Button>
          <Button variant="outline" onClick={handleCancelOrDecline}>
            Decline
          </Button>
          {messageBtn}
        </>
      )
    }

    return (
      <>
        <Button onClick={handleConnect}>
          <UserPlus className="mr-2 h-4 w-4" />
          {connectLabel}
        </Button>
        {messageBtn}
      </>
    )
  }


  // UI
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card>
        <CardContent className="py-6">
          <div className="flex justify-between gap-6">
            <div className="flex gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar || undefined} />
                <AvatarFallback>
                  {profile.full_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-2xl font-bold capitalize">
                  {profile.full_name}
                </h1>

                <AccountTypeBadge
                  userType={profile.user_type || "student"}
                />

                <p className="text-muted-foreground mt-2">
                  {profile.education_level}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex gap-2">
                {isOwner ? (
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/profile")}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                ) : (
                  renderButtons()
                )}
              </div>

              <SocialMediaLinks
                links={profile.social_links || {}}
                editable={false}
              />
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
      <PortfolioSection profile={profile} />
      <ExperienceSection profile={profile} />
      <EducationSection profile={profile} />
      <CertificationsSection profile={profile} />
    </div>
  )
}

export default PublicProfileView
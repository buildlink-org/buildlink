import React, { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {MessageCircle,UserPlus,Pencil,Clock,ThumbsUp,Eye,Users,Briefcase,Star,} from "lucide-react"
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
  | "connected"
  | "self"
// ---------------------------------------------------------------------------
// Fix #3 — Recommendation tags (placeholder until endorsement system ships).
// Shown only to visitors viewing someone else's profile, never to the owner.
// ---------------------------------------------------------------------------
const RECOMMENDATION_TAGS = [
  { label: "Great Collaborator" },
  { label: "Highly Skilled" },
  { label: "Reliable" },
  { label: "Creative Thinker" },
  { label: "Strong Communicator" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Fix #2a — Profession: stored as string or string[] depending on user type.
const getProfessionDisplay = (profile: UserProfile): string | null => {
  const p = (profile as any).profession
  if (!p) return null
  if (Array.isArray(p)) return p.filter(Boolean).join(", ") || null
  return String(p) || null
}

// Fix #2b — Years Active: stored on company profile rows.
const getYearsActive = (profile: UserProfile): string | null => {
  return (profile as any).years_active || null
}

// ---------------------------------------------------------------------------
// Component
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
  const [profileViews, setProfileViews] = useState(0)
  const [connectionsCount, setConnectionsCount] = useState(0)
  const [profileCompletion, setProfileCompletion] = useState(0)

  const openConversation = useMessagingStore((state) => state.openConversation)

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

      setProfileCompletion(
        (data as any)?.profile_completion_score || 0
      )
      const postsResult = await postsService.getPosts()
      if (postsResult.data) {
        setUserPosts(
          postsResult.data.filter((post: any) => post.author_id === profileId)
        )
      }
      const viewsResult =
          await publicProfileService.getProfileViews(profileId)

        if (viewsResult.data) {
          setProfileViews(viewsResult.data.length)
        }

        const connectionsResult =
          await connectionsService.getConnections(profileId)

        if (connectionsResult.data) {
          setConnectionsCount(connectionsResult.data.length)
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

    if (data.status === "accepted") {
      setConnectionStatus("connected")
      setConnectionRow(data)
    } else {
      setConnectionStatus("not_connected")
    }
  }

  fetchConnectionStatus()
}, [user, profileId])

  useEffect(() => {
  if (!profileId || isOwner) return

  publicProfileService.recordProfileView(profileId)
}, [profileId, isOwner])

  // ACTIONS
const handleConnect = async () => {
  if (!user?.id || !profileId) return

  try {
    const { data, error } =
      await connectionsService.connect(user.id, profileId)

    if (error) throw error

    // force instant connection state
    setConnectionRow({
      ...data,
      status: "accepted",
    })

    setConnectionStatus("connected")

    setConnectionsCount((prev) => prev + 1)

    toast({
      title: "Success",
      description: isCompanyProfile
        ? `Now following ${profile?.full_name}`
        : `Connected to ${profile?.full_name} successfully`,
    })
  } catch {
    toast({
      title: "Error",
      description: "Failed to connect",
      variant: "destructive",
    })
  }
}

  

  

 const handleDisconnect = async () => {
  if (!connectionRow?.id) return

  try {
    await connectionsService.removeConnection(connectionRow.id)

    setConnectionRow(null)
    setConnectionStatus("not_connected")

    setConnectionsCount((prev) =>
      Math.max(0, prev - 1)
    )

    toast({
      title: "Success",
      description: isCompanyProfile
        ? `Stopped following ${profile?.full_name}`
        : `Disconnected from ${profile?.full_name} successfully`,
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
        <Button
          variant="outline"
          onClick={handleDisconnect}
        >
          {isCompanyProfile
            ? "Following"
            : "Connected"}
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

  // UI — loading
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (!profile) return null

  const professionDisplay = getProfessionDisplay(profile)
  const yearsActive = getYearsActive(profile)

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-2 sm:px-4">

      {/* ── PROFILE BANNER ─────────────────────────────────────────────── */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col gap-6 md:flex-row md:justify-between">

            {/* Avatar + Identity block */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={profile.avatar || undefined} />
                <AvatarFallback>
                  {profile.full_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1.5">
                {/* Name */}
                <h1 className="text-2xl font-bold capitalize leading-tight">
                  {profile.full_name}
                </h1>

                {/* Account type badge */}
                <AccountTypeBadge userType={profile.user_type || "student"} />

                {/* Fix #2a — Profession (students & professionals) */}
                {!isCompanyProfile && professionDisplay && (
                  <p className="text-sm text-muted-foreground">
                    {professionDisplay}
                  </p>
                )}

                {/* Fix #2b — Years Active (companies only) */}
                {isCompanyProfile && yearsActive && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {yearsActive} years active
                  </p>
                )}

                {isCompanyProfile &&
                  (profile as any).organization && (
                    <p className="text-sm text-muted-foreground">
                      {(profile as any).organization}
                    </p>
                )}

                {/* Fix #3 — Recommendation tags (visitors only, never owner) */}
                {!isOwner && (
                  <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                    {RECOMMENDATION_TAGS.slice(0, 5).map((tag) => (
                      <Badge
                        key={tag.label}
                        variant="outline"
                        className="text-xs px-2 py-0.5 text-muted-foreground border-border gap-1 cursor-default"
                      >
                        <ThumbsUp className="h-3 w-3 text-primary" />
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons + social links */}
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full">
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
          <div className="w-full max-w-xs mt-2">
            <div className="mb-1 flex justify-between text-xs">
              <span>Profile Strength</span>
              <span>{profileCompletion}%</span>
            </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${profileCompletion}%`,
              }}
            />
          </div>
        </div>
        </CardContent>
      </Card>

      {isOwner && (
        <Card>
          <CardContent className="py-5">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

              <div className="rounded-lg border p-4 text-center">
                <Eye className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">
                  {profileViews}
                </p>
                <p className="text-xs text-muted-foreground">
                  Profile Views
                </p>
              </div>

              <div className="rounded-lg border p-4 text-center">
                <Users className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">
                  {connectionsCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  Connections
                </p>
              </div>

              <div className="rounded-lg border p-4 text-center">
                <Briefcase className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">
                  {userPosts.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Posts
                </p>
              </div>

              <div className="rounded-lg border p-4 text-center">
                <Star className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">
                  {profileCompletion}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Completion
                </p>
              </div>

            </div>
          </CardContent>
        </Card>
      ) 
      } 

      {!isOwner && (
        <Card>
          <CardContent className="py-5">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
             

              <div className="rounded-lg border p-4 text-center">
                <Users className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">
                  {connectionsCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  Connections
                </p>
              </div>

              <div className="rounded-lg border p-4 text-center">
                <Briefcase className="mx-auto mb-2 h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">
                  {userPosts.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Posts
                </p>
                
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── BODY SECTIONS ──────────────────────────────────────────────── */}

      {/* About / Activity — owner only (private info) */}
     
      <AboutActivitySection
        publicProfile
        profile={profile}
        userPosts={userPosts}
      />
    

      {/* Fix #1 — Skills always rendered; ProfileSkillsSection handles the empty state */}
      <ProfileSkillsSection profile={profile} />

      <PortfolioSection profile={profile} />
      <ExperienceSection profile={profile} />
      <EducationSection profile={profile} />
      <CertificationsSection profile={profile} />
    </div>
  )
}

export default PublicProfileView
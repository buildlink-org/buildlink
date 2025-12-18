import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, UserPlus, Briefcase, GraduationCap } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { publicProfileService } from "@/services/publicProfileService"
import { useToast } from "@/hooks/use-toast"
import SocialMediaLinks from "./SocialMediaLinks"
import { profileService } from "@/services/profileService"
import { Education, UserProfile } from "@/types"
import { connectionsService } from "@/services/connectionsService"   // Added
import { useMessagingStore } from "@/stores/messagingStore"

type ConnectionStatus = 
| "not_connected"
| "pending_outgoing"   // current user sent request
| "pending_incoming"   // other user sent request (you can accept)
| "connected"
| "self"; 

const PublicProfileView: React.FC = () => {
	const { profileId } = useParams<{ profileId: string }>()
	const { user } = useAuth()
	const { toast } = useToast()
	const [profile, setProfile] = useState<UserProfile | null>()
	const [loading, setLoading] = useState(true)
	const [viewRecorded, setViewRecorded] = useState(false)
	const [connectionRow, setConnectionRow] = useState<any | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("not_connected");

	const openConversation = useMessagingStore((state) => state.openConversation);
  

	const student = profile?.user_type === "student"
	const professional = profile?.user_type === "professional"
	const company = profile?.user_type === "company"

	useEffect(() => {
		if (profileId) {
			if (user.id === profileId) loadCurrentUser()
			else loadPublicProfile()
		}
	}, [profileId])

	const loadPublicProfile = async () => {
		if (!profileId) return

		try {
			const { data, error } = await publicProfileService.getPublicProfile(profileId, user?.id)

			if (error) {
				toast({
					title: "Error",
					description: "Failed to load profile or profile is not public",
					variant: "destructive",
				})
				return
			}

			setProfile(data)

			// Record profile view if not own profile and not already recorded
			if (user && user.id !== profileId && !viewRecorded) {
				await publicProfileService.recordProfileView(profileId)
				setViewRecorded(true)
			}
		} catch (error) {
			console.error("Error loading public profile:", error)
		} finally {
			setLoading(false)
		}
	}

	const loadCurrentUser = async () => {
		if (!user.id) return

		try {
			const { data, error } = await profileService.getProfile(user.id)

			if (error) {
				toast({
					title: "Error",
					description: "Failed to load profile or user does not exist",
					variant: "destructive",
				})
				return
			}

			setProfile(data)
		} catch (error) {
			console.error("Error loading public profile:", error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const fetchConnectionStatus = async () => {
			if (!user?.id || !profileId) {
				setConnectionStatus("not_connected");
				setConnectionRow(null);
				return;
			  }
		
			  if (user.id === profileId) {
				setConnectionStatus("self");
				setConnectionRow(null);
				return;
			  }

			const { data, error } = await connectionsService.getConnectionStatus(user.id, profileId)

			if (error) {
				console.error("Error fetching connection status:", error)
				setConnectionStatus("not_connected")
				setConnectionRow(null);
				return
			}

			if (!data) {
				setConnectionStatus("not_connected");
				setConnectionRow(null);
				return;
			  }
		
			  // If a row exists, check status and who initiated
			  setConnectionRow(data);
		
			  if (data.status === "accepted") {
				setConnectionStatus("connected");
			  } else if (data.status === "pending") {
				if (data.user_id === user.id) {
				  setConnectionStatus("pending_outgoing"); // we sent it
				} else if (data.connected_user_id === user.id) {
				  setConnectionStatus("pending_incoming"); // they sent it -> can accept
				} else {
				  setConnectionStatus("not_connected");
				}
			  } else {
				setConnectionStatus("not_connected");
			  }
		}

		fetchConnectionStatus()
	}, [user, profileId])

	const handleConnect = async () => {
		if (!user?.id || !profileId) {
			toast({
				title: "Error",
				description: "You must be logged in to send connection requests.",
				variant: "destructive",
			})
			return
		}

		if (connectionStatus === "pending_outgoing" || connectionStatus === "connected") {
			toast({
				title: "Info",
				description: "Connection request already sent or already connected.",
				variant: "default",
			})
			return
		}

		const { data, error } = await connectionsService.connect(user.id, profileId)

		if (error) {
			toast({
				title: "Error",
				description: "Failed to send connection request.",
				variant: "destructive",
			})
			console.error("Error sending connection request:", error)
			return
		}

		setConnectionRow(data);
		setConnectionStatus("pending_outgoing")
		toast({
			title: "Success",
			description: "Connection request sent!",
		})
	}

	const handleAccept = async () => {
		if (!connectionRow?.id) {
		  toast({ title: "Error", description: "No connection request to accept.", variant: "destructive" });
		  return;
		}
	
		const { data, error } = await connectionsService.acceptRequest(connectionRow.id);
		if (error) {
		  console.error("Error accepting request:", error);
		  toast({ title: "Error", description: "Failed to accept request.", variant: "destructive" });
		  return;
		}
	
		// update UI
		setConnectionRow(data);
		setConnectionStatus("connected");
		toast({ title: "Success", description: "Connection accepted." });
	  };
	
	  // Render buttons (simplified)
	  const renderConnectButtons = () => {
		if (!user || connectionStatus === "self") return null;

		const messageButton = (
			<Button 
			  variant="outline"
			  onClick={() => {
				// Can only message a connection
				// if (connectionStatus !== "connected") {
				//   toast({ title: "Info", description: "Connect first to send messages", variant: "default" });
				//   return;
				// }
			//    Open messaging dialog
				openConversation(profileId!, profile?.full_name, profile?.avatar);
			  }}
			//   className={connectionStatus !== "connected" && "opacity-50 cursor-not-allowed"}
			//   title={connectionStatus !== "connected" ? "Connect first to send messages" : ""}
			>
			  <MessageCircle className="mr-2 h-4 w-4" />
			  Message
			</Button>
		  );
		
	
		if (connectionStatus === "connected") {
		  return (
			<>
				<Button variant="outline" disabled>
			  		Connected
				</Button>
		        {messageButton}
			</>
		  );
		}
	
		if (connectionStatus === "pending_outgoing") {
		  return (
			<>
			   <Button disabled>Pending</Button>
			   {messageButton}
		    </>
		  );
		}
	
		if (connectionStatus === "pending_incoming") {
		  // show Accept button and optionally a decline button (not implemented here)
		  return (
			<>
			  <Button onClick={handleAccept}>
				Accept
			  </Button>
			  {messageButton}
			</>
		  );
		}
	 // default: not connected
	 return (
		<>
		  <Button onClick={handleConnect}>
			<UserPlus className="mr-2 h-4 w-4" />
			Connect
		  </Button>
		  {messageButton}
		</>
	  );
	};
  


	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
			</div>
		)
	}
	// console.log(profile)

	if (!profile) {
		return (
			<Card>
				<CardContent className="p-8 text-center">
					<h3 className="mb-2 text-lg font-semibold">Profile Not Found</h3>
					<p className="text-muted-foreground">This profile doesn't exist or is not public.</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Profile Header */}
			<Card>
				<CardContent className="p-6">
					<div className="flex flex-col gap-6 md:flex-row">
						<div className="flex-shrink-0">
							<Avatar className="h-24 w-24 md:h-24 md:w-24">
								<AvatarImage src={profile.avatar} />
								<AvatarFallback className="text-2xl">{profile.full_name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
							</Avatar>
						</div>

						<div className="flex-1 space-y-4">
							<div>
								<div className="mb-2 flex items-center gap-2">
									<h1 className="text-2xl font-bold">{profile.full_name}</h1>
									{/* <VerificationBadges badges={verification_badges } /> */}
								</div>

								<div className="mb-1 flex items-center text-muted-foreground">
									<Briefcase className="mr-2 h-4 w-4" />
									<span>{profile?.profession || "(profession: Not set)"}</span>
									<span className="ml-2">at {profile.organization || "(Org : Not set)"}</span>
								</div>

								{/* {profile.title && ( */}
								<div className="mb-1 flex items-center text-muted-foreground">
									<GraduationCap className="mr-2 h-4 w-4" />
									<span>{profile.title || "(title : Not set)"}</span>
								</div>
								{/* )} */}
							</div>
						</div>
					</div>

					<p className="mt-4 text-muted-foreground">{profile.bio || "No Bio Provided"}</p>

					<SocialMediaLinks links={profile.social_links || {}} />

					{user && connectionStatus !== "self" && (
						<div className="mt-4 flex gap-2">
							{renderConnectButtons()}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Skills Section */}
			{professional && (
				<Card>
					<CardHeader>
						<CardTitle>Skills</CardTitle>
					</CardHeader>
					{profile.skills && profile.skills.length > 0 && (
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{profile.skills.map((skill: string, index: number) => (
									<Badge
										key={index}
										variant="secondary">
										{skill}
									</Badge>
								))}
							</div>
						</CardContent>
					)}
				</Card>
			)}

			{/* Education Section */}
			{(student || professional) && (
				<Card>
					<CardHeader>
						<CardTitle>Education & Training</CardTitle>
					</CardHeader>
					{profile.education && profile.education.length > 0 && (
						<CardContent className="space-y-4">
							{profile.education.map(({ degree, institution, description, endDate, startDate }: Education, index: number) => (
								<div
									key={index}
									className="border-l-2 border-muted pl-4">
									<h3 className="font-semibold">{degree}</h3>
									<p className="text-sm text-muted-foreground">{institution}</p>
									<p className="text-xs text-muted-foreground">
										{startDate} - {endDate || "Present"}
									</p>
									{description && <p className="mt-2 text-sm">{description}</p>}
								</div>
							))}
						</CardContent>
					)}
				</Card>
			)}

			{/* Experience Section */}
			{(student || professional) && (
				<Card>
					<CardHeader>
						<CardTitle>Professional Experience</CardTitle>
					</CardHeader>
					{profile.experiences && profile.experiences.length > 0 && (
						<CardContent className="space-y-4">
							{profile.experiences.map((exp: any, index: number) => (
								<div
									key={index}
									className="border-l-2 border-muted pl-4">
									<h3 className="font-semibold">{exp.title}</h3>
									<p className="text-sm text-muted-foreground">{exp.company}</p>
									<p className="text-xs text-muted-foreground">
										{exp.startDate} - {exp.endDate || "Present"}
									</p>
									{exp.description && <p className="mt-2 text-sm">{exp.description}</p>}
								</div>
							))}
						</CardContent>
					)}
				</Card>
			)}

			{/* Certification Section */}
			{professional && (
				<Card>
					<CardHeader>
						<CardTitle>Certifications</CardTitle>
					</CardHeader>
					{profile.Certification && profile.Certification.length > 0 && (
						<CardContent className="space-y-4">
							{profile.education.map((edu: any, index: number) => (
								<div
									key={index}
									className="border-l-2 border-muted pl-4">
									<h3 className="font-semibold">{edu.degree}</h3>
									<p className="text-sm text-muted-foreground">{edu.institution}</p>
									<p className="text-xs text-muted-foreground">
										{edu.startDate} - {edu.endDate || "Present"}
									</p>
									{edu.description && <p className="mt-2 text-sm">{edu.description}</p>}
								</div>
							))}
						</CardContent>
					)}
				</Card>
			)}

			{/* Jobs/Roles Section */}
			{company && (
				<Card>
					<CardHeader>
						<CardTitle>Roles</CardTitle>
					</CardHeader>
					{profile.Certification && profile.Certification.length > 0 && (
						<CardContent className="space-y-4">
							{profile.education.map((edu: any, index: number) => (
								<div
									key={index}
									className="border-l-2 border-muted pl-4">
									<h3 className="font-semibold">{edu.degree}</h3>
									<p className="text-sm text-muted-foreground">{edu.institution}</p>
									<p className="text-xs text-muted-foreground">
										{edu.startDate} - {edu.endDate || "Present"}
									</p>
									{edu.description && <p className="mt-2 text-sm">{edu.description}</p>}
								</div>
							))}
						</CardContent>
					)}
				</Card>
			)}

			{/* Connection Preview */}
			{(student || professional) && (
				<Card>
					<CardHeader>
						<CardTitle>Connection Preview</CardTitle>
					</CardHeader>
					<CardContent></CardContent>
				</Card>
			)}

			{/* People Preview */}
			{company && (
				<Card>
					<CardHeader>
						<CardTitle>People</CardTitle>
					</CardHeader>
					<CardContent></CardContent>
				</Card>
			)}

			{/* Products/Services */}
			{company && (
				<Card>
					<CardHeader>
						<CardTitle>Products/Services</CardTitle>
					</CardHeader>
					<CardContent></CardContent>
				</Card>
			)}

			{/* Events */}
			{company && (
				<Card>
					<CardHeader>
						<CardTitle>Events</CardTitle>
					</CardHeader>
					<CardContent></CardContent>
				</Card>
			)}

			{/* Life/Culture */}
			{company && (
				<Card>
					<CardHeader>
						<CardTitle>Life/Culture</CardTitle>
					</CardHeader>
					<CardContent></CardContent>
				</Card>
			)}
			
		</div>
	)
}

export default PublicProfileView

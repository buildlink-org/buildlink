import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import AboutActivitySection from "@/components/profile-sections/details/AboutActivitySection"
import CertificationsSection from "@/components/profile-sections/details/CertificationsSection"
import EducationSection from "@/components/profile-sections/details/EducationSection"
import ExperienceSection from "@/components/profile-sections/details/ExperienceSection"
import PortfolioSection from "@/components/profile-sections/details/PortfolioSection"
import ProfileSkillsSection from "@/components/profile-sections/details/ProfileSkillsSection"
import ProfileHeader from "@/components/feeds/ProfileHeader"
import PublicProfileView from "@/components/profile/PublicProfileView"
import { getProfileSubtitle } from "@/lib/profileDisplay"
import { StudentProfile } from "@/types"

const publicProfileMocks = vi.hoisted(() => ({
	getPublicProfile: vi.fn(),
	getPosts: vi.fn(),
	recordProfileView: vi.fn(),
	getConnectionStatus: vi.fn(),
	toast: vi.fn(),
}))

vi.mock("@/contexts/AuthContext", () => ({
	useAuth: () => ({ user: null }),
}))

vi.mock("@/hooks/use-toast", () => ({
	useToast: () => ({ toast: publicProfileMocks.toast }),
}))

vi.mock("@/services/publicProfileService", () => ({
	publicProfileService: {
		getPublicProfile: publicProfileMocks.getPublicProfile,
		recordProfileView: publicProfileMocks.recordProfileView,
	},
}))

vi.mock("@/services/postsService", () => ({
	postsService: { getPosts: publicProfileMocks.getPosts },
}))

vi.mock("@/services/connectionsService", () => ({
	connectionsService: { getConnectionStatus: publicProfileMocks.getConnectionStatus },
}))

vi.mock("@/stores/messagingStore", () => ({
	useMessagingStore: () => vi.fn(),
}))

vi.mock("@/components/profile/SuggestedConnections", () => ({
	default: () => null,
}))

vi.mock("@/components/ProfileEditDialog", () => ({
	default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/ProfileSettingsDialog", () => ({
	default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/profile/ShareProfileDialog", () => ({
	default: ({ trigger }: { trigger: ReactNode }) => <>{trigger}</>,
}))

vi.mock("@/components/profile/SocialLinksEditDialog", () => ({
	default: ({ trigger }: { trigger: ReactNode }) => <>{trigger}</>,
}))

vi.mock("@/components/profile-sections/AvatarUploader", () => ({
	default: () => <div aria-label="Profile avatar" />,
}))

vi.mock("@/components/RatingDialog", () => ({ default: () => null }))
vi.mock("@/components/feeds/VerificationBadges", () => ({ default: () => null }))

const emptyStudentProfile: StudentProfile = {
	id: "student-1",
	title: "",
	full_name: "Test Student",
	avatar: null,
	banner: null,
	bio: null,
	account_tier: "basic",
	profile_visibility: "public",
	verification_level: "unverified",
	verification_badges: [],
	social_links: {},
	created_at: "2026-01-01T00:00:00.000Z",
	updated_at: "2026-01-01T00:00:00.000Z",
	user_type: "student",
	featured: [],
	people: [],
	products: [],
	profession: [],
	organization: "",
	education_level: null,
	skills: [],
	portfolio: [],
	experiences: [],
	education: [],
	certifications: [],
}

describe("student profile UI", () => {
	it("renders a saved institution and education level beneath the student badge", () => {
		render(
			<ProfileHeader
				profile={{
					...emptyStudentProfile,
					education_level: "Undergraduate level",
					organization: "Buildlink University",
				}}
				uploading={false}
				handleAvatarChange={async () => {}}
				handleAvatarRemove={async () => {}}
				handleProfileUpdate={() => {}}
			/>,
		)

		expect(screen.getByText("Undergraduate level - Buildlink University")).toBeInTheDocument()
	})

	it("shows the level and institution or clear placeholders below the student badge", () => {
		expect(
			getProfileSubtitle({
				...emptyStudentProfile,
				education_level: "Undergraduate level",
				organization: "Buildlink University",
			}),
		).toBe("Undergraduate level - Buildlink University")

		expect(getProfileSubtitle(emptyStudentProfile)).toBe(
			"Education level not added - Institution not added",
		)
		expect(
			getProfileSubtitle({
				...emptyStudentProfile,
				organization: "Buildlink University",
			}),
		).toBe("Education level not added - Buildlink University")
	})

	it("shows the selected discipline for every student signup profession", () => {
		expect(
			getProfileSubtitle({
				...emptyStudentProfile,
				profession: ["technological-solutions"],
				education_level: "Undergraduate level",
				organization: "Tom Mboya University",
			}),
		).toBe("Technological Solutions - Undergraduate level - Tom Mboya University")
	})

	it("differentiates active and inactive profile tabs in light and dark themes", () => {
		render(
			<AboutActivitySection
				profile={emptyStudentProfile}
				userPosts={[]}
				publicProfile
			/>,
		)

		const bioTab = screen.getByRole("tab", { name: "Bio" })
		const activityTab = screen.getByRole("tab", { name: "Activity" })

		expect(bioTab).toHaveAttribute("aria-selected", "true")
		expect(bioTab.className).toContain("data-[state=active]:bg-[#fde68a]")
		expect(bioTab.closest(".dark\\:bg-student-900\\/50")).not.toBeNull()
		expect(activityTab.className).toContain("bg-white")
		expect(activityTab.className).toContain("dark:bg-slate-950")
		expect(screen.getByText("Share your course, your interests, and what you're working towards.")).toBeInTheDocument()
	})

	it("aligns the edit, social-links, settings, and share actions in the profile header", () => {
		render(
			<ProfileHeader
				profile={emptyStudentProfile}
				uploading={false}
				handleAvatarChange={async () => {}}
				handleAvatarRemove={async () => {}}
				handleProfileUpdate={() => {}}
			/>,
		)

		expect(screen.getByRole("button", { name: "Profile settings" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Share profile" })).toBeInTheDocument()

		const editButton = screen.getByRole("button", { name: "Edit Profile" })
		const socialLinksButton = screen.getByRole("button", { name: "Social Links" })
		const actionGrid = editButton.parentElement

		expect(actionGrid).toBe(socialLinksButton.parentElement)
		expect(actionGrid).toHaveClass("grid-cols-[2.5rem_10rem]")
		expect(socialLinksButton).toHaveClass("w-full")
	})

	it("shows useful empty states on public student profiles", () => {
		render(
			<>
				<ProfileSkillsSection profile={emptyStudentProfile} />
				<PortfolioSection profile={emptyStudentProfile} />
				<ExperienceSection profile={emptyStudentProfile} />
				<EducationSection profile={emptyStudentProfile} />
				<CertificationsSection profile={emptyStudentProfile} />
			</>,
		)

		expect(screen.getByText("No skills listed yet.")).toBeInTheDocument()
		expect(screen.getByText("No projects added yet")).toBeInTheDocument()
		expect(screen.getByText("No professional experience listed yet")).toBeInTheDocument()
		expect(screen.getByText("No education & training listed yet")).toBeInTheDocument()
		expect(screen.getByText("No licences or certifications listed yet")).toBeInTheDocument()
	})

	it("renders useful sections and empty states on a public profile with no student details", async () => {
		publicProfileMocks.getPublicProfile.mockResolvedValue({
			data: emptyStudentProfile,
			error: null,
		})
		publicProfileMocks.getPosts.mockResolvedValue({ data: [] })
		publicProfileMocks.getConnectionStatus.mockResolvedValue({ data: null, error: null })
		publicProfileMocks.recordProfileView.mockResolvedValue(undefined)

		render(
			<MemoryRouter initialEntries={["/profile/student-1"]}>
				<Routes>
					<Route path="/profile/:profileId" element={<PublicProfileView />} />
				</Routes>
			</MemoryRouter>,
		)

		await waitFor(() => expect(publicProfileMocks.getPublicProfile).toHaveBeenCalled())

		expect(await screen.findByRole("heading", { name: "Test Student" })).toBeInTheDocument()
		expect(screen.getByText("Education level not added - Institution not added")).toBeInTheDocument()
		expect(screen.getByText("Share your course, your interests, and what you're working towards.")).toBeInTheDocument()
		expect(screen.getByText("No skills listed yet.")).toBeInTheDocument()
		expect(screen.getByText("No projects added yet")).toBeInTheDocument()
		expect(screen.getByText("No professional experience listed yet")).toBeInTheDocument()
		expect(screen.getByText("No education & training listed yet")).toBeInTheDocument()
		expect(screen.getByText("No licences or certifications listed yet")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Social Links" })).not.toBeInTheDocument()
	})

	it("shows the saved education level and institution on a public student profile", async () => {
		publicProfileMocks.getPublicProfile.mockResolvedValue({
			data: {
				...emptyStudentProfile,
				education_level: "Undergraduate level",
				organization: "Buildlink University",
			},
			error: null,
		})
		publicProfileMocks.getPosts.mockResolvedValue({ data: [] })
		publicProfileMocks.getConnectionStatus.mockResolvedValue({ data: null, error: null })
		publicProfileMocks.recordProfileView.mockResolvedValue(undefined)

		render(
			<MemoryRouter initialEntries={["/profile/student-1"]}>
				<Routes>
					<Route path="/profile/:profileId" element={<PublicProfileView />} />
				</Routes>
			</MemoryRouter>,
		)

		expect(await screen.findByText("Undergraduate level - Buildlink University")).toBeInTheDocument()
	})
})

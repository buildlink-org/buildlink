import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import ProfileEditDialog from "@/components/ProfileEditDialog"

const mocks = vi.hoisted(() => ({
	updateProfile: vi.fn(),
	toast: vi.fn(),
}))

vi.mock("@/contexts/AuthContext", () => ({
	useAuth: () => ({ user: { id: "student-1" } }),
}))

vi.mock("@/services/profileService", () => ({
	profileService: { updateProfile: mocks.updateProfile },
}))

vi.mock("@/hooks/use-toast", () => ({
	useToast: () => ({ toast: mocks.toast }),
}))

vi.mock("@/components/ui/select", () => ({
	Select: ({
		value,
		onValueChange,
		children,
	}: {
		value: string
		onValueChange: (value: string) => void
		children: ReactNode
	}) => (
		<select value={value} onChange={(event) => onValueChange(event.target.value)}>
			{children}
		</select>
	),
	SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
	SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
		<option value={value}>{children}</option>
	),
	SelectTrigger: () => null,
	SelectValue: () => null,
}))

describe("student profile editing", () => {
	beforeEach(() => {
		mocks.updateProfile.mockReset().mockResolvedValue({ error: null })
		mocks.toast.mockReset()
	})

	it("saves a trimmed institution and the signup education-level value", async () => {
		render(
			<ProfileEditDialog
				currentProfile={{
					full_name: "Test Student",
					profession: "architecture",
					organization: "Tom Mboya University",
					education_level: "Undergraduate level",
					user_type: "student",
				}}
			>
				<button type="button">Edit Profile</button>
			</ProfileEditDialog>,
		)

		fireEvent.click(screen.getByRole("button", { name: "Edit Profile" }))

		const institution = screen.getByLabelText("University / College")
		expect(institution).toHaveValue("Tom Mboya University")
		expect(institution).toBeRequired()
		fireEvent.change(institution, { target: { value: "  Buildlink University  " } })
		expect(screen.getByRole("combobox")).toHaveValue("Undergraduate level")
		expect(screen.getByRole("option", { name: "Undergraduate level" })).toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Update Profile" }))

		await waitFor(() => {
			expect(mocks.updateProfile).toHaveBeenCalledWith(
				"student-1",
				expect.objectContaining({
					organization: "Buildlink University",
					education_level: "Undergraduate level",
				}),
			)
		})
	})
})

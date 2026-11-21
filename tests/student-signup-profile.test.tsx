import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
	signUp: vi.fn(),
	toast: vi.fn(),
	showOtpModal: vi.fn(),
}))

vi.mock("@/contexts/AuthContext", () => ({
	useAuth: () => ({ signUp: mocks.signUp }),
}))

vi.mock("@/hooks/use-toast", () => ({
	useToast: () => ({ toast: mocks.toast }),
}))

vi.mock("@/components/ui/select", async () => {
	const ReactModule = await import("react")
	const SelectItem = () => null
	const Select = ({
		value,
		onValueChange,
		children,
	}: {
		value: string
		onValueChange: (value: string) => void
		children: React.ReactNode
	}) => {
		const items: React.ReactElement<{ value: string; children: React.ReactNode }>[] = []
		const collectItems = (nodes: React.ReactNode) => {
			ReactModule.Children.forEach(nodes, (node) => {
				if (!ReactModule.isValidElement(node)) return
				if (node.type === SelectItem) {
					items.push(node as React.ReactElement<{ value: string; children: React.ReactNode }>)
					return
				}
				if ("children" in node.props) collectItems(node.props.children)
			})
		}
		collectItems(children)
		return (
			<select value={value} onChange={(event) => onValueChange(event.target.value)}>
				<option value="">Choose</option>
				{items.map((item) => (
					<option key={item.props.value} value={item.props.value}>
						{item.props.children}
					</option>
				))}
			</select>
		)
	}

	return {
		Select,
		SelectItem,
		SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
		SelectTrigger: () => null,
		SelectValue: () => null,
	}
})

vi.mock("@/components/auth/SkillsAutocomplete", () => ({
	default: ({
		selected,
		onChange,
	}: {
		selected: string[]
		onChange: (skills: string[]) => void
	}) => (
		<button type="button" onClick={() => onChange([...selected, "Site Analysis"])}>
			Add test skill
		</button>
	),
}))

import SignUpForm from "@/components/auth/SignUpForm"

describe("student signup profile details", () => {
	beforeEach(() => {
		localStorage.clear()
		mocks.signUp.mockReset().mockResolvedValue({
			error: null,
			data: { user: { identities: [{}] } },
		})
		mocks.toast.mockReset()
		mocks.showOtpModal.mockReset()
	})

	it("requires an institution and saves the signup level and institution as profile metadata", async () => {
		render(<SignUpForm showOtpModal={mocks.showOtpModal} />)

		fireEvent.change(screen.getByRole("combobox"), { target: { value: "student" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))

		fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "student@example.com" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByPlaceholderText("Create a password"), { target: { value: "password123" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByPlaceholderText("Confirm password"), { target: { value: "password123" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByPlaceholderText("Enter your full name"), { target: { value: "Test Student" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByRole("combobox"), { target: { value: "architecture" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByRole("combobox"), { target: { value: "Undergraduate level" } })

		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		expect(screen.getByText("University or school is required")).toBeInTheDocument()

		fireEvent.change(screen.getByLabelText("University / School"), { target: { value: "Buildlink University" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.click(screen.getByRole("button", { name: "Add test skill" }))
		fireEvent.click(screen.getByRole("button", { name: "Finish" }))

		await waitFor(() => expect(mocks.signUp).toHaveBeenCalledOnce())
		expect(mocks.signUp).toHaveBeenCalledWith(
			"student@example.com",
			"password123",
			expect.objectContaining({
				user_type: "student",
				profession: "architecture",
				education_level: "Undergraduate level",
				organization: "Buildlink University",
				skills: ["Site Analysis"],
			}),
		)
	})

	it("saves the education and institution details for a professional account", async () => {
		render(<SignUpForm showOtpModal={mocks.showOtpModal} />)

		fireEvent.change(screen.getByRole("combobox"), { target: { value: "professional" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByPlaceholderText("Enter your email"), { target: { value: "professional@example.com" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByPlaceholderText("Create a password"), { target: { value: "password123" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByPlaceholderText("Confirm password"), { target: { value: "password123" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByPlaceholderText("Enter your full name"), { target: { value: "Test Professional" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByRole("combobox"), { target: { value: "engineering" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.change(screen.getByRole("combobox"), { target: { value: "Postgraduate level" } })
		fireEvent.change(screen.getByLabelText("University / School"), { target: { value: "Engineering Institute" } })
		fireEvent.click(screen.getByRole("button", { name: "Next" }))
		fireEvent.click(screen.getByRole("button", { name: "Add test skill" }))
		fireEvent.click(screen.getByRole("button", { name: "Finish" }))

		await waitFor(() => expect(mocks.signUp).toHaveBeenCalledOnce())
		expect(mocks.signUp).toHaveBeenCalledWith(
			"professional@example.com",
			"password123",
			expect.objectContaining({
				user_type: "professional",
				profession: "engineering",
				education_level: "Postgraduate level",
				organization: "Engineering Institute",
				skills: ["Site Analysis"],
			}),
		)
	})
})

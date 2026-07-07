import { useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignInForm from "./SignInForm"
import SignUpForm from "./SignUpForm"
import OtpVerificationModal from "./OTPVerifyModal"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import buildlinkLogo from "@/assets/buildlink-logo.png?w=240&quality=90&format=webp"

const AuthPage = () => {
	const { user, loading } = useAuth()
	const { theme, toggleTheme } = useTheme()

	const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
	const [otpEmail, setOtpEmail] = useState("")

	const [searchParams] = useSearchParams()
	const tab = searchParams.get("tab")

	// open modal
	const showOtpModal = (email: string) => {
		setOtpEmail(email)
		setIsOtpModalOpen(true)
	}

	// close modal
	const closeOtpModal = () => {
		setIsOtpModalOpen(false)
		setOtpEmail("")
	}

	// Redirect if already authenticated
	if (user && !loading) {
		return <Navigate to="/feed" replace />
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
			</div>
		)
	}

	return (
		<>
			{/* Full-page background that respects dark mode */}
			<div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">

				{/* Theme toggle — top-right corner */}
				<div className="absolute right-4 top-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleTheme}
						aria-label="Toggle theme"
					>
						{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
					</Button>
				</div>

				{/* Logo + brand */}
				<div className="mb-8 flex flex-col items-center gap-3">
					<img src={buildlinkLogo} alt="BuildLink" className="h-12 w-auto" />
					<span className="text-2xl font-bold text-primary">BuildLink</span>
					<p className="text-sm text-muted-foreground">
						Connect, build, and grow your professional network
					</p>
				</div>

				{/* Auth card */}
				<div className="w-full max-w-md">
					<Tabs defaultValue={tab || "signin"} className="w-full">
						<TabsList className="grid w-full grid-cols-2 mb-4">
							<TabsTrigger value="signin">Sign In</TabsTrigger>
							<TabsTrigger value="signup">Sign Up</TabsTrigger>
						</TabsList>

						<TabsContent value="signin">
							<SignInForm showOtpModal={showOtpModal} />
						</TabsContent>

						<TabsContent value="signup">
							<SignUpForm showOtpModal={showOtpModal} />
						</TabsContent>
					</Tabs>

					{/* Back to landing */}
					<p className="mt-6 text-center text-xs text-muted-foreground">
						<a href="/" className="hover:text-primary hover:underline transition-colors">
							← Back to home
						</a>
					</p>
				</div>
			</div>

			{isOtpModalOpen && (
				<OtpVerificationModal email={otpEmail} onClose={closeOtpModal} />
			)}
		</>
	)
}

export default AuthPage
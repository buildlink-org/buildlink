import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import buildlinkLogo from "@/assets/buildlink-logo.png"
import { HashLink } from "react-router-hash-link"
import UserProfileButton from "@/components/UserProfileButton"

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	return (
		<header className="fixed left-0 right-0 top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
			<div className="container mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center space-x-2">
						<img
							src={buildlinkLogo}
							alt="BuildLink Logo"
							className="h-8 w-auto object-contain"
						/>
						<span className="text-xl font-bold text-primary">BuildLink</span>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden items-center space-x-8 md:flex">
						<HashLink
							smooth
							to="/feed"
							className="text-foreground transition-colors hover:text-primary">
							{" "}
							Home
						</HashLink>
						<HashLink
							smooth
							to="/#features"
							className="text-foreground transition-colors hover:text-primary">
							{" "}
							Features
						</HashLink>
						<HashLink
							smooth
							to="/#process"
							className="text-foreground transition-colors hover:text-primary">
							{" "}
							Process
						</HashLink>

						<UserProfileButton />
					</nav>

					{/* Mobile Menu Button */}
					<button
						className="text-foreground hover:text-primary md:hidden"
						onClick={() => setIsMenuOpen(!isMenuOpen)}>
						{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<nav className="mt-4 border-t pb-4 md:hidden">
						<div className="flex flex-col space-y-4 pt-4">
							<HashLink
								smooth
								to="/feed"
								className="text-foreground transition-colors hover:text-primary">
								{" "}
								Home
							</HashLink>
							<HashLink
								smooth
								to="/#features"
								className="text-foreground transition-colors hover:text-primary">
								{" "}
								Features
							</HashLink>
							<HashLink
								smooth
								to="/#process"
								className="text-foreground transition-colors hover:text-primary">
								{" "}
								Process
							</HashLink>

							<div className="flex flex-col space-y-2 pt-4">
								<a href="/auth">
									<Button
										variant="cta"
										size="sm"
										className="w-full">
										Log In
									</Button>
								</a>
							</div>
						</div>
					</nav>
				)}
			</div>
		</header>
	)
}

export default Header

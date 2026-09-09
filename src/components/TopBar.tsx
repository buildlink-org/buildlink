import { Search, BarChart3, Settings, Sun, Moon, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useLocation, useNavigate } from "react-router-dom"
import UserProfileButton from "@/components/UserProfileButton"
import SearchDialog from "@/components/SearchDialog"
import EnhancedNotificationsDropdown from "@/components/EnhancedNotificationsDropdown"
import SearchDropdown from "./SearchDropdown"
import { useIsAdmin } from "@/hooks/useIsAdmin"
import { cn } from "@/lib/utils"
import logo from "@/assets/buildlink-logo.png?w=240&quality=90&format=webp"
import { useTheme } from "@/contexts/ThemeContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopBarProps {
	onLogoClick: () => void
	onMenuClick?: () => void
	loading?: boolean
}

const TopBar = ({ onLogoClick, onMenuClick, loading }: TopBarProps) => {
	const { isAdmin } = useIsAdmin()
	const location = useLocation()
	const navigate = useNavigate()
	const { theme, toggleTheme } = useTheme()

	return (
		<header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
			<div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 md:px-8">
				{/* Left side - Menu + Logo */}
				<div className="flex items-center space-x-3">
					<div
						className="flex cursor-pointer items-center"
						onClick={onLogoClick}>
						<img
							src={logo}
							alt="BuildLink Logo"
							className="mr-2 h-6 w-6"
						/>
						<span className="text-lg font-semibold">BuildLink</span>
					</div>
					{loading && <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>}
				</div>

				{/* Center - Search Bar */}
				<div className="mx-2 hidden max-w-md flex-1 sm:flex lg:mx-4">
					<SearchDropdown />
				</div> 

        {/* Right side actions */}
				<div className="flex items-center space-x-4">
					<SearchDialog>
						<Button
							variant="ghost"
							size="icon"
							className="sm:hidden">
							<Search className="h-5 w-5" />
						</Button>
					</SearchDialog>

					{/* Dark / Light mode toggle */}
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleTheme}
						title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
						aria-label="Toggle theme"
					>
						{theme === "dark" ? (
							<Sun className="h-5 w-5" />
						) : (
							<Moon className="h-5 w-5" />
						)}
					</Button>

					{isAdmin && (
						<>
							{/* Desktop inline admin links */}
							<div className="hidden sm:flex items-center space-x-1">
								<Link to="/admin-analytics">
									<Button
										variant="ghost"
										size="icon"
										title="Analytics"
										aria-label="View analytics dashboard"
										className={cn(location.pathname === "/admin-analytics" && "bg-accent text-accent-foreground")}>
										<BarChart3 className="h-5 w-5" />
									</Button>
								</Link>
								<Link to="/admin-resources">
									<Button
										variant="ghost"
										size="icon"
										title="Admin Panel"
										aria-label="Open admin panel"
										className={cn(location.pathname === "/admin-resources" && "bg-accent text-accent-foreground")}>
										<Settings className="h-5 w-5" />
									</Button>
								</Link>
							</div>
							{/* Mobile admin dropdown */}
							<div className="sm:hidden">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											title="Admin actions"
											aria-label="Admin actions">
											<Settings className="h-5 w-5" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuItem onClick={() => navigate("/admin-analytics")}>
											<BarChart3 className="mr-2 h-4 w-4" />
											Analytics
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => navigate("/admin-resources")}>
											<Settings className="mr-2 h-4 w-4" />
											Resources
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</>
					)}
					<EnhancedNotificationsDropdown />
					<UserProfileButton />
				</div>
			</div>
		</header>
	)
}

export default TopBar
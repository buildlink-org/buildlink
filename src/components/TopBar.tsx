import { Search, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import UserProfileButton from "@/components/UserProfileButton"
import SearchDialog from "@/components/SearchDialog"
import EnhancedNotificationsDropdown from "@/components/EnhancedNotificationsDropdown"
import SearchDropdown from "./SearchDropdown"
import { useIsAdmin } from "@/hooks/useIsAdmin"
import { cn } from "@/lib/utils"
import logo from "@/assets/buildlink-logo.png"

interface TopBarProps {
	onLogoClick: () => void
	onMenuClick?: () => void
	loading?: boolean
}

const TopBar = ({ onLogoClick, onMenuClick, loading }: TopBarProps) => {
	const { isAdmin } = useIsAdmin()
	const location = useLocation()

	return (
		<header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

				{/*<div className="mx-2 hidden max-w-md flex-1 sm:flex lg:mx-4">
          <SearchDialog>
            <div className="relative w-full cursor-pointer">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search posts, mentors, courses..."
                className="w-full cursor-pointer pl-10"
                readOnly
              />
            </div>
          </SearchDialog>
        </div>  /*}

        {/* Right side actions */}
				<div className="flex items-center space-x-1">
					<SearchDialog>
						<Button
							variant="ghost"
							size="icon"
							className="sm:hidden">
							<Search className="h-5 w-5" />
						</Button>
					</SearchDialog>

					{isAdmin && (
						<>
							<Link to="/admin-analytics">
								<Button
									variant="ghost"
									size="icon"
									title="Analytics"
									className={cn(location.pathname === "/admin-analytics" && "bg-accent text-accent-foreground")}>
									<BarChart3 className="h-5 w-5" />
								</Button>
							</Link>
							<Link to="/admin-resources">
								<Button
									variant="ghost"
									size="icon"
									title="Admin Panel"
									className={cn(location.pathname === "/admin-resources" && "bg-accent text-accent-foreground")}>
									<Settings className="h-5 w-5" />
								</Button>
							</Link>
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

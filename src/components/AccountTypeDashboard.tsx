import StudentDashboard from "./StudentDashboard"
import GraduateDashboard from "./GraduateDashboard"
import ProfessionalDashboard from "./ProfessionalDashboard"
import CompanyDashboard from "./CompanyDashboard"
import { UserProfile } from "@/types"

interface AccountTypeDashboardProps {
	profile: UserProfile
}

const AccountTypeDashboard = ({ profile }: AccountTypeDashboardProps) => {
	const userType = profile?.user_type?.toLowerCase() || "student"

	switch (userType) {
		case "student":
			return <StudentDashboard profile={profile} />
		// case "graduate":
		// 	return <GraduateDashboard profile={profile} />
		case "professional":
			return <ProfessionalDashboard profile={profile} />
		case "company":
			return <CompanyDashboard profile={profile} />
		default:
			return <StudentDashboard profile={profile} />
	}
}

export default AccountTypeDashboard

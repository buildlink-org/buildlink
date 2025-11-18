import { supabase } from "@/integrations/supabase/client"
import { UserProfile } from "@/types"

export const profileService = {
	async getProfile(userId: string) {
		const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

		return { data, error }
	},

	async updateProfile(userId: string, updates: UserProfile) {
		const { data, error } = await supabase
			.from("profiles")
			.update({
				...updates,
				updated_at: new Date().toISOString(),
			})
			.eq("id", userId)
			.select()
			.single()

		return { data, error }
	},

	async uploadAvatar(userId: string, file: File) {
		const fileExt = file.name.split(".").pop()
		const fileName = `${userId}-${Math.random()}.${fileExt}`
		const filePath = `avatars/${fileName}`

		const { data: uploadData, error: uploadError } = await supabase.storage.from("uploads").upload(filePath, file)

		if (uploadError) {
			return { data: null, error: uploadError }
		}

		const { data: publicUrlData } = supabase.storage.from("uploads").getPublicUrl(filePath)
	},

	async getStats() {
		try {
			// Method 1: Use separate count queries (more reliable)
			const { count: professionalsCount, error: professionalsError } = await supabase.from("profiles").select("*", { count: "exact" }).in("user_type", [ "professional"])

			const { count: studentsCount, error: studentError } = await supabase.from("profiles").select("*", { count: "exact" }).in("user_type", ["student"])

			const { count: companiesCount, error: companiesError } = await supabase.from("profiles").select("*", { count: "exact" }).eq("user_type", "company")

			if (professionalsError) {
				console.error("Error counting professionals:", professionalsError)
				throw professionalsError
			}

			if (studentError) {
				console.error("Error counting professionals:", studentError)
				throw studentError
			}

			if (companiesError) {
				console.error("Error counting companies:", companiesError)
				throw companiesError
			}

			console.log("Raw counts from Supabase:", {
				studentsCount,
				professionalsCount,
				companiesCount,
			})

			return {
				data: {
					professionalsCount: professionalsCount || 0,
					companiesCount: companiesCount || 0,
					studentsCount: studentsCount || 0,
				},
				error: null,
			}
		} catch (error) {
			console.error("Error in getStats:", error)
			return {
				data: null,
				error: error,
			}
		}
	},
}

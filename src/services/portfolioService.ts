import { supabase } from "@/integrations/supabase/client"
import { PortfolioItem } from "@/types"

/**
 * Single source of truth for persisting a user's portfolio (fix #9).
 * Used by both PortfolioSection and PortfolioEditorDialog so error handling
 * and the update payload stay consistent.
 */
export const portfolioService = {
	async save(profileId: string, items: PortfolioItem[]) {
		return await supabase
			.from("profiles")
			.update({ portfolio: items })
			.eq("id", profileId)
	},
}

import React from "react"

interface EmptyStateProps {
	icon?: React.ReactNode
	title: string
	description: string
	/** Primary action button, e.g. "Add skills" */
	action?: React.ReactNode
	className?: string
}

/**
 * Instructional empty state used across profile sections.
 * Replaces placeholder text ("N/A", "[Placeholder]", fake cards) with clear guidance.
 */
const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = "" }) => {
	return (
		<div
			className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-8 text-center ${className}`}>
			{icon && (
				<div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground" aria-hidden="true">
					{icon}
				</div>
			)}
			<p className="text-sm font-semibold text-foreground">{title}</p>
			<p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">{description}</p>
			{action && <div className="mt-4">{action}</div>}
		</div>
	)
}

export default EmptyState

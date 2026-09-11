import React from "react"
import EditIconButton from "./EditIconButton"


interface SectionHeaderProps {
	title: string
	/** Optional count, e.g. number of entries */
	count?: number
	/** Unit for the count, e.g. "entries", "items" */
	countUnit?: string
	/** Short descriptor shown under the title */
	description?: string
	/** Accessible label for the edit button, e.g. "Edit skills". Omit to hide the edit control. */
	editLabel?: string
	onEdit?: () => void
	/** Optional trailing action (e.g. "See all" button) */
	action?: React.ReactNode
}

/**
 * Consistent section header: title + count badge + descriptor + accessible edit control.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
	title,
	count,
	countUnit = "entries",
	description,
	editLabel,
	onEdit,
	action,
}) => {
	return (
		<div className="mb-4 flex items-start justify-between gap-3">
			<div className="min-w-0">
				<div className="flex flex-wrap items-center gap-2">
					<h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">{title}</h3>
					{typeof count === "number" && (
						<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
							{count} {countUnit}
						</span>
					)}
				</div>
				{description && <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{description}</p>}
			</div>
			<div className="flex flex-shrink-0 items-center gap-1">
				{action}
				{editLabel && onEdit && <EditIconButton label={editLabel} onClick={onEdit} />}
			</div>
		</div>
	)
}

export default SectionHeader

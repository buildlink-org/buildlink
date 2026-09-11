import React from "react"
import { Pencil } from "lucide-react"

interface EditIconButtonProps {
	/** Accessible name, e.g. "Edit skills" */
	label: string
	onClick?: () => void
	className?: string
}

/**
 * Accessible edit icon button with a 44px hit area.
 * The visual icon is 16px but the button container meets touch-target requirements.
 */
const EditIconButton: React.FC<EditIconButtonProps> = ({ label, onClick, className = "" }) => {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			title={label}
			className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}>
			<Pencil className="h-4 w-4" aria-hidden="true" />
		</button>
	)
}

export default EditIconButton

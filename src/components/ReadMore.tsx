import React, { useState } from "react"

export default function ReadMoreText({ text, maxLength = 150 }) {
	const [expanded, setExpanded] = useState(false)

	if (!text) return null

	const isLong = text.length > maxLength
	const displayedText = expanded || !isLong ? text : text.slice(0, maxLength) + "... "

	return (
		<div>
			<p style={{ display: "inline" }}>{displayedText}</p>

			{isLong && (
				<button
					onClick={() => setExpanded(!expanded)}
					className="font-medium text-primary">
					{expanded ? " Read less" : "Read more"}
				</button>
			)}
		</div>
	)
}

import { ReactNode } from "react"

interface CorePageGridProps {
	navigation?: ReactNode
	children: ReactNode
}

const CorePageGrid = ({ navigation, children }: CorePageGridProps) => (
	<div className="mx-auto grid w-full max-w-screen-2xl grid-cols-12 gap-x-4 gap-y-6 px-4 pt-14 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-8">
		{navigation && (
			<div className="col-span-12 min-w-0 md:col-span-3 md:pt-1">
				{navigation}
			</div>
		)}
		<div className={`col-span-12 min-w-0 ${navigation ? "md:col-span-9 md:col-start-4" : "md:col-span-12"}`}>
			{children}
		</div>
	</div>
)

export default CorePageGrid

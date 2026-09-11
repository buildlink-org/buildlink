import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { profileService } from "@/services/profileService"
import { useToast } from "@/hooks/use-toast"
import EducationFormFields from "./EducationFormFields"
import EducationList from "./EducationList"

interface Education {
	degree: string
	institution: string
	/** Structured study period */
	startDate?: string
	endDate?: string
	/** Field of study / major */
	fieldOfStudy?: string
	/** Legacy free-form year/duration — kept so older entries remain editable */
	year?: string
	description?: string
}

/**
 * Normalize legacy entries: if an entry only has the old free-form `year`
 * (e.g. "2015-2019" or "2020"), derive structured start/end dates so the
 * upgraded form can edit them (report §6.4).
 */
const normalizeEdu = (edu: Education): Education => {
	if ((!edu.startDate && !edu.endDate) && edu.year) {
		const years = String(edu.year).match(/\d{4}/g)
		if (years && years.length > 0) {
			return {
				...edu,
				startDate: edu.startDate || years[0],
				endDate: edu.endDate || years[years.length - 1],
			}
		}
	}
	return edu
}

interface EducationEditDialogProps {
	children: React.ReactNode
	currentProfile?: any
	onProfileUpdated?: () => void
}

const EducationEditDialog = ({ children, currentProfile, onProfileUpdated }: EducationEditDialogProps) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [education, setEducation] = useState<Education[]>(
		(currentProfile?.education || []).map(normalizeEdu)
	)
	const [newEducation, setNewEducation] = useState<Education>({
		degree: "",
		institution: "",
		startDate: "",
		endDate: "",
		fieldOfStudy: "",
		description: "",
	})
	const [editingIndex, setEditingIndex] = useState<number | null>(null)

	// Prepare editing state for individual education
	const [editEducation, setEditEducation] = useState<Education | null>(null)

	const hasPeriod = (edu: Education) =>
		Boolean(edu.startDate?.trim() || edu.endDate?.trim() || edu.year?.trim())

	const addEducation = () => {
		if (newEducation.degree.trim() && newEducation.institution.trim() && hasPeriod(newEducation)) {
			setEducation([...education, { ...newEducation }])
			setNewEducation({ degree: "", institution: "", startDate: "", endDate: "", fieldOfStudy: "", description: "" })
		}
	}

	const startEdit = (index: number) => {
		setEditingIndex(index)
		setEditEducation(normalizeEdu(education[index]))
	}

	const handleEditChange = (edu: Education) => {
		setEditEducation(edu)
	}

	const saveEdit = () => {
		if (editingIndex !== null && editEducation) {
			const updated = [...education]
			updated[editingIndex] = { ...editEducation }
			setEducation(updated)
			setEditingIndex(null)
			setEditEducation(null)
		}
	}

	const cancelEdit = () => {
		setEditingIndex(null)
		setEditEducation(null)
	}

	const removeEducation = (index: number) => {
		setEducation(education.filter((_, i) => i !== index))
		if (editingIndex === index) cancelEdit()
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!user) return

		setIsLoading(true)
		try {
			// Prefer structured dates — drop the legacy free-form year on entries
			// that now carry start/end so the two can never disagree.
			const normalized = education.map((edu) =>
				edu.startDate?.trim() || edu.endDate?.trim() ? { ...edu, year: undefined } : edu
			)
			const { error } = await profileService.updateProfile(user.id, { education: normalized })

			if (error) throw error

			toast({
				title: "Success",
				description: "Education updated successfully!",
			})

			setOpen(false)
			onProfileUpdated?.()
		} catch (error) {
			console.error("Error updating education:", error)
			toast({
				title: "Error",
				description: "Failed to update education. Please try again.",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]"
				description="Add, edit, or remove your education and training entries">
				<DialogHeader>
					<DialogTitle>Edit Education & Training</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={handleSubmit}
					className="space-y-6">
					<div className="space-y-4 rounded-md border p-4">
						<Label className="text-base font-semibold">Add New Education</Label>
						<EducationFormFields
							education={newEducation}
							onChange={setNewEducation}
							idPrefix="new"
						/>
						<Button
							type="button"
							onClick={addEducation}
							variant="outline"
							className="w-full"
							disabled={
								!newEducation.degree.trim() ||
								!newEducation.institution.trim() ||
								!(newEducation.startDate?.trim() || newEducation.endDate?.trim())
							}>
							<Plus className="mr-2 h-4 w-4" />
							Add Education
						</Button>
					</div>
					<div>
						<Label className="text-base font-semibold">Your Education</Label>
						<EducationList
							education={education}
							editingIndex={editingIndex}
							onEdit={startEdit}
							onDelete={removeEducation}
							renderEditing={(index) =>
								editEducation &&
								editingIndex === index && (
									<div>
										<EducationFormFields
											education={editEducation}
											onChange={handleEditChange}
											idPrefix={`edit-${index}`}
											showLabels={false}
										/>
										<div className="mt-2 flex justify-end space-x-2">
											<Button
												type="button"
												onClick={cancelEdit}
												variant="outline"
												size="sm">
												Cancel
											</Button>
											<Button
												type="button"
												onClick={saveEdit}
												size="sm">
												Save
											</Button>
										</div>
									</div>
								)
							}
						/>
					</div>
					<div className="flex justify-end space-x-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isLoading}>
							{isLoading ? "Updating..." : "Update Education"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default EducationEditDialog

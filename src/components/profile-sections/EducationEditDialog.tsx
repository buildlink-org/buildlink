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
	year: string
	description?: string
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
	const [education, setEducation] = useState<Education[]>(currentProfile?.education || [])
	const [newEducation, setNewEducation] = useState<Education>({
		degree: "",
		institution: "",
		year: "",
		description: "",
	})
	const [editingIndex, setEditingIndex] = useState<number | null>(null)

	// Prepare editing state for individual education
	const [editEducation, setEditEducation] = useState<Education | null>(null)

	const addEducation = () => {
		if (newEducation.degree.trim() && newEducation.institution.trim() && newEducation.year.trim()) {
			setEducation([...education, { ...newEducation }])
			setNewEducation({ degree: "", institution: "", year: "", description: "" })
		}
	}

	const startEdit = (index: number) => {
		setEditingIndex(index)
		setEditEducation(education[index])
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
			const { error } = await profileService.updateProfile(user.id, { education })

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
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
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
							disabled={!newEducation.degree.trim() || !newEducation.institution.trim() || !newEducation.year.trim()}>
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

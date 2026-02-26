import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { profileService } from "@/services/profileService"
import { useToast } from "@/hooks/use-toast"
import ExperienceFormFields from "./ExperienceFormFields"
import ExperienceList from "./ExperienceList"

interface Experience {
	title: string
	company: string
	duration: string
	description?: string
}

interface ExperienceEditDialogProps {
	children: React.ReactNode
	currentProfile?: any
	onProfileUpdated?: () => void
}

const ExperienceEditDialog = ({ children, currentProfile, onProfileUpdated }: ExperienceEditDialogProps) => {
	const { user } = useAuth()
	const { toast } = useToast()
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const [experiences, setExperiences] = useState<Experience[]>([])
	const [newExperience, setNewExperience] = useState<Experience>({
		title: "",
		company: "",
		duration: "",
		description: "",
	})
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [editingExperience, setEditingExperience] = useState<Experience>({
		title: "",
		company: "",
		duration: "",
		description: "",
	})

	// Update experiences when dialog opens or currentProfile changes
	React.useEffect(() => {
		if (open && currentProfile?.experiences) {
			setExperiences(currentProfile.experiences || [])
		}
	}, [open, currentProfile])

	const addExperience = () => {
		if (newExperience.title.trim() && newExperience.company.trim() && newExperience.duration.trim()) {
			setExperiences([...experiences, { ...newExperience }])
			setNewExperience({
				title: "",
				company: "",
				duration: "",
				description: "",
			})
		}
	}

	const removeExperience = (index: number) => {
		setExperiences(experiences.filter((_, i) => i !== index))
	}

	const startEditingExperience = (index: number) => {
		setEditingIndex(index)
		setEditingExperience({ ...experiences[index] })
	}

	const saveEditingExperience = () => {
		if (editingIndex !== null && editingExperience.title.trim() && editingExperience.company.trim() && editingExperience.duration.trim()) {
			const updatedExperiences = [...experiences]
			updatedExperiences[editingIndex] = { ...editingExperience }

			setExperiences(updatedExperiences)
			setEditingIndex(null)
			setEditingExperience({
				title: "",
				company: "",
				duration: "",
				description: "",
			})
		}
	}

	const cancelEditingExperience = () => {
		setEditingIndex(null)
		setEditingExperience({
			title: "",
			company: "",
			duration: "",
			description: "",
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!user) return

		setIsLoading(true)
		try {
			// Save the updated experiences to the profile

			const { error } = await profileService.updateProfile(user.id, {
				experiences: experiences,
			})

			if (error) throw error

			toast({
				title: "Success",
				description: "Experience updated successfully!",
			})

			setOpen(false)
			onProfileUpdated?.()
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update experience. Please try again.",
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
					<DialogTitle>Edit Professional Experience</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-6">
					<div className="space-y-4 rounded-md border p-4">
						<Label className="text-base font-semibold">Add New Experience</Label>
						<ExperienceFormFields
							experience={newExperience}
							onChange={setNewExperience}
							idPrefix="add"
						/>
						<Button
							type="button"
							onClick={addExperience}
							variant="outline"
							className="w-full"
							disabled={!newExperience.title.trim() || !newExperience.company.trim() || !newExperience.duration.trim()}>
							<Plus className="mr-2 h-4 w-4" />
							Add Experience
						</Button>
					</div>

					<div className="space-y-3">
						<Label className="text-base font-semibold">Your Experience</Label>
						<ExperienceList
							experiences={experiences}
							editingIndex={editingIndex}
							onEdit={startEditingExperience}
							onDelete={removeExperience}
							renderEditing={(index) => (
								<>
									<ExperienceFormFields
										experience={editingExperience}
										onChange={setEditingExperience}
										idPrefix={`edit-${index}`}
										showLabels={true}
									/>
									<div className="mt-3 flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={cancelEditingExperience}>
											Cancel
										</Button>
										<Button
											type="button"
											size="sm"
											onClick={saveEditingExperience}
											disabled={!editingExperience.title.trim() || !editingExperience.company.trim() || !editingExperience.duration.trim()}>
											Save
										</Button>
									</div>
								</>
							)}
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
							disabled={isLoading }>
							{isLoading ? "Updating..." : "Update Experience"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default ExperienceEditDialog

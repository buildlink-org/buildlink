import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { useIsAdmin } from "@/hooks/useIsAdmin"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Skeleton } from "../ui/skeleton"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "@/pages/LandingPage/components/Footer"
import TopBar from "../TopBar"

type SkillResource = {
	id?: string
	title: string
	provider: string
	type: string
	category: string
	difficulty_level: string
	description: string
	link: string
	price?: number
	duration?: string
	thumbnail?: string
}

const emptyResource: SkillResource = {
	title: "",
	provider: "",
	type: "course",
	category: "",
	difficulty_level: "beginner",
	description: "",
	link: "",
	price: 0,
	duration: "",
	thumbnail: "",
}

const AdminPanelResources = () => {
	const { user } = useAuth()
	const { isAdmin, isLoading: adminLoading } = useIsAdmin()
	const queryClient = useQueryClient()
	const [editing, setEditing] = useState<SkillResource | null>(null)
	const [form, setForm] = useState<SkillResource>(emptyResource)
	const [isNew, setIsNew] = useState(true)
	const navigate = useNavigate()

	// Fetch all resources
	const {
		data: resources,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["all-skill-resources"],
		queryFn: async () => {
			const { data, error } = await supabase.from("skill_resources").select("*").order("created_at", { ascending: false })
			if (error) throw error
			return data
		},
		enabled: !!user && isAdmin,
	})

	// Mutations
	const upsertMutation = useMutation({
		mutationFn: async (payload: SkillResource) => {
			const upsertData = { ...payload }
			if (!isNew && upsertData.id) {
				// Update
				const { data, error } = await supabase.from("skill_resources").update(upsertData).eq("id", upsertData.id).select()
				if (error) throw error
				return data
			} else {
				// Create
				const { data, error } = await supabase.from("skill_resources").insert([upsertData]).select()
				if (error) throw error
				return data
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["all-skill-resources"] })
			setEditing(null)
			setForm(emptyResource)
			setIsNew(true)
		},
	})

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from("skill_resources").delete().eq("id", id)
			if (error) throw error
			return id
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["all-skill-resources"] })
		},
	})

	// Handle form
	const handleEdit = (resource: SkillResource) => {
		setEditing(resource)
		setForm(resource)
		setIsNew(false)
	}
	const handleNew = () => {
		setEditing(null)
		setForm(emptyResource)
		setIsNew(true)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target
		setForm((f) => ({ ...f, [name]: value }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		upsertMutation.mutate(form)
	}

	if (adminLoading) return <div className="p-8 text-center">Checking permissions...</div>
	if (!isAdmin) return <div className="p-8 text-center text-red-600">You must be an admin to access this page.</div>

	const handleGoBack = () => {
		navigate("/feed")
	}
  
	return (
		<>
			<TopBar onLogoClick={handleGoBack} />
			<div className="mx-auto my-12 max-w-3xl space-y-8 p-4">
				<Card>
					<CardHeader>
						<CardTitle>{isNew ? "Create New Resource" : "Update Resource"}</CardTitle>
					</CardHeader>
					<CardContent>
						<form
							className="space-y-4"
							onSubmit={handleSubmit}>
							<div className="flex flex-wrap gap-4">
								<Input
									name="title"
									value={form.title}
									onChange={handleChange}
									placeholder="Resource Title"
									required
									className="flex-1"
								/>
								<Input
									name="provider"
									value={form.provider}
									onChange={handleChange}
									placeholder="Provider (e.g. Coursera)"
									required
									className="flex-1"
								/>
								<Input
									name="type"
									value={form.type}
									onChange={handleChange}
									placeholder="Type (course, article, webinar, certification)"
									required
									className="flex-1"
								/>
								<Input
									name="category"
									value={form.category}
									onChange={handleChange}
									placeholder="Category (e.g. IT, Business)"
									className="flex-1"
								/>
								<Input
									name="difficulty_level"
									value={form.difficulty_level}
									onChange={handleChange}
									placeholder="Difficulty (beginner/intermediate/advanced)"
									className="flex-1"
								/>
							</div>
							<Textarea
								name="description"
								value={form.description}
								onChange={handleChange}
								placeholder="Description"
								required
								className="w-full"
							/>
							<Input
								name="link"
								value={form.link}
								onChange={handleChange}
								placeholder="External Link (https://...)"
								required
								className="w-full"
							/>
							<div className="flex gap-4">
								<Input
									name="price"
									type="number"
									value={form.price ?? ""}
									onChange={handleChange}
									placeholder="Price"
									className="flex-1"
								/>
								<Input
									name="duration"
									value={form.duration}
									onChange={handleChange}
									placeholder="Duration (e.g. 3h, 10 modules)"
									className="flex-1"
								/>
								<Input
									name="thumbnail"
									value={form.thumbnail}
									onChange={handleChange}
									placeholder="Thumbnail URL"
									className="flex-1"
								/>
							</div>
							<div className="flex justify-end space-x-2 pt-2">
								{!isNew && (
									<Button
										type="button"
										onClick={handleNew}
										variant="outline">
										Cancel
									</Button>
								)}
								<Button type="submit">{isNew ? "Create Resource" : "Update Resource"}</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				{isLoading ? (
					<div className="space-y-2">
						<Skeleton className="h-16 w-full" />
						<Skeleton className="h-16 w-full" />
					</div>
				) : error ? (
					<div className="text-red-600">{error.message}</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>All Resources</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="min-w-full text-sm">
									<thead>
										<tr>
											<th className="px-2 py-1 text-left">Title</th>
											<th className="px-2 py-1 text-left">Type</th>
											<th className="px-2 py-1 text-left">Category</th>
											<th className="px-2 py-1 text-left">Provider</th>
											<th className="px-2 py-1"></th>
										</tr>
									</thead>
									<tbody>
										{resources?.map((res: SkillResource) => (
											<tr
												key={res.id}
												className="group hover:bg-muted-foreground/10">
												<td className="px-2 py-1">{res.title}</td>
												<td className="px-2 py-1">{res.type}</td>
												<td className="px-2 py-1">{res.category}</td>
												<td className="px-2 py-1">{res.provider}</td>
												<td className="flex gap-1 px-2 py-1">
													<Button
														variant="secondary"
														size="sm"
														onClick={() => handleEdit(res)}>
														Edit
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onClick={() => {
															if (window.confirm("Delete resource?")) {
																if (res.id) deleteMutation.mutate(res.id)
															}
														}}>
														Delete
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
			<Footer />
		</>
	)
}

export default AdminPanelResources

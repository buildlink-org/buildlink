import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import EditIconButton from "@/components/profile/EditIconButton"
import { useToast } from "@/hooks/use-toast"
import { profileService } from "@/services/profileService"
import { CompanyProfile, Products } from "@/types"

type Milestone = { title: string; year?: string }

interface CompanyProfileSectionsProps {
	profile: CompanyProfile
	canEdit?: boolean
	onProfileUpdated?: () => void
}

const CompanyProfileSections = ({ profile, canEdit = false, onProfileUpdated }: CompanyProfileSectionsProps) => {
	const { toast } = useToast()
	const [locations, setLocations] = useState<string[]>(profile.locations || [])
	const [milestones, setMilestones] = useState<Milestone[]>(profile.milestones || [])
	const [products, setProducts] = useState<Products[]>(profile.products || [])
	const [newLocation, setNewLocation] = useState("")
	const [newMilestone, setNewMilestone] = useState<Milestone>({ title: "", year: "" })
	const [newProduct, setNewProduct] = useState<Products>({ name: "", description: "", link: "" })
	const [saving, setSaving] = useState(false)
	const [productsExpanded, setProductsExpanded] = useState(false)
	const [milestonesExpanded, setMilestonesExpanded] = useState(false)
	const [locationsOpen, setLocationsOpen] = useState(false)
	const [milestonesOpen, setMilestonesOpen] = useState(false)
	const [productsOpen, setProductsOpen] = useState(false)

	useEffect(() => {
		setLocations(profile.locations || [])
		setMilestones(profile.milestones || [])
		setProducts(profile.products || [])
	}, [profile.locations, profile.milestones, profile.products])

	const save = async (field: "locations" | "milestones" | "products", value: string[] | Milestone[] | Products[]) => {
		setSaving(true)
		try {
			const { error } = await profileService.updateProfile(profile.id, { [field]: value })
			if (error) throw error
			onProfileUpdated?.()
			toast({ title: "Company profile updated" })
			setLocationsOpen(false)
			setMilestonesOpen(false)
			setProductsOpen(false)
		} catch (error) {
			console.error(`Unable to update company ${field}:`, error)
			toast({ title: "Update failed", description: `We couldn't save ${field}. Please try again.`, variant: "destructive" })
		} finally {
			setSaving(false)
		}
	}

	const addLocation = () => {
		const location = newLocation.trim()
		if (!location || locations.length >= 5 || locations.some((item) => item.toLowerCase() === location.toLowerCase())) return
		setLocations((current) => [...current, location])
		setNewLocation("")
	}

	const addMilestone = () => {
		if (!newMilestone.title.trim()) return
		setMilestones((current) => [...current, { title: newMilestone.title.trim(), year: newMilestone.year?.trim() || undefined }])
		setNewMilestone({ title: "", year: "" })
	}

	const addProduct = () => {
		const name = newProduct.name?.trim()
		if (!name) return
		setProducts((current) => [...current, {
			...newProduct,
			name: name.slice(0, 100),
			description: newProduct.description?.trim().slice(0, 100) || undefined,
			link: newProduct.link?.trim() || undefined,
		}])
		setNewProduct({ name: "", description: "", link: "" })
	}

	return (
		<>
			<Card className="border border-border shadow-sm">
				<CardContent className="p-4">
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<h2 className="text-lg font-semibold">Products & Services</h2>
							<span className="rounded-full bg-muted px-2 py-0.5 text-xs">{products.length}</span>
						</div>
						{canEdit && (
							<Dialog open={productsOpen} onOpenChange={setProductsOpen}>
								<DialogTrigger asChild><EditIconButton label="Edit products and services" /></DialogTrigger>
								<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
									<DialogHeader><DialogTitle>Edit Products & Services</DialogTitle></DialogHeader>
									<div className="space-y-3">
										{products.map((product, index) => (
											<div key={`${product.name}-${index}`} className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]">
												<Input aria-label="Product or service name" maxLength={100} value={product.name || product.title || ""} onChange={(event) => setProducts((items) => items.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} />
												<Input aria-label="Link" value={product.link || ""} placeholder="Link (optional)" onChange={(event) => setProducts((items) => items.map((item, i) => i === index ? { ...item, link: event.target.value } : item))} />
												<Button type="button" variant="ghost" size="icon" aria-label={`Remove ${product.name || "item"}`} onClick={() => setProducts((items) => items.filter((_, i) => i !== index))}><X className="h-4 w-4" /></Button>
												<Textarea className="sm:col-span-3" aria-label="Description" maxLength={100} value={product.description || ""} placeholder="Description (100 characters max)" onChange={(event) => setProducts((items) => items.map((item, i) => i === index ? { ...item, description: event.target.value } : item))} />
											</div>
										))}
										<div className="space-y-2 rounded-md border p-3">
											<Label htmlFor="new-product">Add a product or service</Label>
											<Input id="new-product" value={newProduct.name || ""} maxLength={100} placeholder="Name" onChange={(event) => setNewProduct((item) => ({ ...item, name: event.target.value }))} />
											<Textarea value={newProduct.description || ""} maxLength={100} placeholder="Description (100 characters max)" onChange={(event) => setNewProduct((item) => ({ ...item, description: event.target.value }))} />
											<Input value={newProduct.link || ""} placeholder="Link (optional)" onChange={(event) => setNewProduct((item) => ({ ...item, link: event.target.value }))} />
											<Button type="button" variant="outline" onClick={addProduct} disabled={!newProduct.name?.trim()}><Plus className="mr-2 h-4 w-4" />Add item</Button>
										</div>
									</div>
									<div className="flex justify-end"><Button onClick={() => void save("products", products.map((product) => ({ ...product, name: (product.name || product.title || "").trim().slice(0, 100), description: product.description?.trim().slice(0, 100) || undefined })))} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></div>
								</DialogContent>
							</Dialog>
						)}
					</div>
					{products.length ? (
						<div className="space-y-3">
							{(productsExpanded ? products : products.slice(0, 2)).map((product, index) => (
								<div key={`${product.name || product.title}-${index}`} className="rounded-lg border border-company-200 bg-company-50 p-3 dark:border-company-800 dark:bg-company-950/40">
									<h3 className="font-medium">{(product.name || product.title || "").slice(0, 100)}</h3>
									{product.description && <p className="mt-1 text-sm text-muted-foreground">{product.description.slice(0, 100)}</p>}
									{product.link && <a className="mt-1 inline-block text-sm text-primary underline" href={product.link} target="_blank" rel="noreferrer">View details</a>}
								</div>
							))}
							{products.length > 2 && <Button type="button" variant="ghost" size="sm" onClick={() => setProductsExpanded((expanded) => !expanded)}>{productsExpanded ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}{productsExpanded ? "Read less" : "… read more"}</Button>}
						</div>
					) : <p className="text-sm text-muted-foreground">No products or services added.</p>}
				</CardContent>
			</Card>

			<Card className="border border-border shadow-sm">
				<CardContent className="p-4">
					<div className="mb-3 flex items-center justify-between">
						<h2 className="text-lg font-semibold">Milestones & Achievements</h2>
						{canEdit && (
							<Dialog open={milestonesOpen} onOpenChange={setMilestonesOpen}>
								<DialogTrigger asChild><EditIconButton label="Edit milestones and achievements" /></DialogTrigger>
								<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
									<DialogHeader><DialogTitle>Edit Milestones & Achievements</DialogTitle></DialogHeader>
									<div className="space-y-2">
										{milestones.map((milestone, index) => (
											<div key={`${milestone.title}-${index}`} className="flex gap-2">
												<Input aria-label="Milestone" maxLength={100} value={milestone.title} onChange={(event) => setMilestones((items) => items.map((item, i) => i === index ? { ...item, title: event.target.value } : item))} />
												<Input aria-label="Year" className="w-24" value={milestone.year || ""} placeholder="Year" onChange={(event) => setMilestones((items) => items.map((item, i) => i === index ? { ...item, year: event.target.value } : item))} />
												<Button type="button" variant="ghost" size="icon" aria-label={`Remove ${milestone.title}`} onClick={() => setMilestones((items) => items.filter((_, i) => i !== index))}><X className="h-4 w-4" /></Button>
											</div>
										))}
										<div className="flex gap-2">
											<Input aria-label="New milestone" maxLength={100} value={newMilestone.title} placeholder="Milestone or achievement" onChange={(event) => setNewMilestone((item) => ({ ...item, title: event.target.value }))} />
											<Input aria-label="Milestone year" className="w-24" value={newMilestone.year || ""} placeholder="Year" onChange={(event) => setNewMilestone((item) => ({ ...item, year: event.target.value }))} />
										</div>
										<Button type="button" variant="outline" onClick={addMilestone} disabled={!newMilestone.title.trim()}><Plus className="mr-2 h-4 w-4" />Add milestone</Button>
									</div>
									<div className="flex justify-end"><Button onClick={() => void save("milestones", milestones.map((milestone) => ({ ...milestone, title: milestone.title.trim().slice(0, 100) })))} disabled={saving}>{saving ? "Saving…" : "Save"}</Button></div>
								</DialogContent>
							</Dialog>
						)}
					</div>
					{milestones.length ? <ul className="space-y-2">{(milestonesExpanded ? milestones : milestones.slice(0, 2)).map((item, index) => <li key={`${item.title}-${index}`} className="flex justify-between gap-3 rounded-lg border border-company-200 bg-company-50 p-3 dark:border-company-800 dark:bg-company-950/40"><span>{item.title}</span>{item.year && <span className="shrink-0 text-sm text-muted-foreground">{item.year}</span>}</li>)}</ul> : <p className="text-sm text-muted-foreground">No milestones or achievements added.</p>}
					{milestones.length > 2 && <Button type="button" variant="ghost" size="sm" onClick={() => setMilestonesExpanded((expanded) => !expanded)}>{milestonesExpanded ? <ChevronUp className="mr-1 h-4 w-4" /> : <ChevronDown className="mr-1 h-4 w-4" />}{milestonesExpanded ? "Read less" : "… read more"}</Button>}
				</CardContent>
			</Card>

			<Card className="border border-border shadow-sm">
				<CardContent className="p-4">
					<div className="mb-3 flex items-center justify-between">
						<div className="flex items-center gap-2"><h2 className="text-lg font-semibold">Locations</h2><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{locations.length}/5</span></div>
						{canEdit && (
							<Dialog open={locationsOpen} onOpenChange={setLocationsOpen}>
								<DialogTrigger asChild><EditIconButton label="Edit company locations" /></DialogTrigger>
								<DialogContent className="sm:max-w-lg">
									<DialogHeader><DialogTitle>Edit Locations</DialogTitle></DialogHeader>
									<div className="space-y-3">
										<div className="flex gap-2"><Input value={newLocation} maxLength={100} placeholder="Add a location" onChange={(event) => setNewLocation(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addLocation())} /><Button type="button" variant="outline" onClick={addLocation} disabled={locations.length >= 5 || !newLocation.trim()}><Plus className="mr-2 h-4 w-4" />Add</Button></div>
										<p className="text-xs text-muted-foreground">Add up to 5 locations.</p>
										<div className="flex flex-wrap gap-2">{locations.map((location) => <span key={location} className="inline-flex items-center gap-1 rounded-full bg-company-100 px-3 py-1 text-sm text-company-900 dark:bg-company-900/50 dark:text-company-100">{location}<button type="button" aria-label={`Remove ${location}`} onClick={() => setLocations((items) => items.filter((item) => item !== location))}><X className="h-3 w-3" /></button></span>)}</div>
									</div>
									<div className="flex justify-end"><Button onClick={() => void save("locations", locations.slice(0, 5))} disabled={saving || locations.length > 5}>{saving ? "Saving…" : "Save"}</Button></div>
								</DialogContent>
							</Dialog>
						)}
					</div>
					{locations.length ? <div className="flex flex-wrap gap-2">{locations.slice(0, 5).map((location) => <span key={location} className="rounded-full bg-company-100 px-3 py-1 text-sm font-medium text-company-900 dark:bg-company-900/50 dark:text-company-100">{location}</span>)}</div> : <p className="text-sm text-muted-foreground">No locations added.</p>}
				</CardContent>
			</Card>
		</>
	)
}

export default CompanyProfileSections

import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, BadgePlus, X, Image as ImageIcon, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioItem } from "@/types";
import { portfolioService } from "@/services/portfolioService";

interface PortfolioEditorDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  portfolioList: PortfolioItem[];
  profileId: string;
  handleProfileUpdate: () => void;
  onPortfolioAdd?: (item: PortfolioItem) => void;
  asIconButton?: boolean;
  disabled?: boolean;
}

// Built-environment discipline taxonomy (report §15)
const PROJECT_TYPES = [
  "Architecture",
  "Civil Engineering",
  "Structural Engineering",
  "Construction Management",
  "Quantity Surveying",
  "Urban Planning",
  "Surveying",
  "Real Estate",
  "Construction Technology",
  "Interior Design",
  "Other",
];

const PROJECT_STATUSES = ["Completed", "In Progress", "Planning", "On Hold"];

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const PortfolioEditorDialog: React.FC<PortfolioEditorDialogProps> = ({
  open,
  setOpen,
  portfolioList,
  profileId,
  handleProfileUpdate,
  onPortfolioAdd,
  asIconButton = false,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [linkURL, setLinkURL] = useState("");
  const [desc, setDesc] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectRole, setProjectRole] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [projectYear, setProjectYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const thumbnailInput = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const isHttpUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setSelectedPreviews(previews);
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [selectedFiles]);

  // Fix #2 — persistence now surfaces failures so success feedback is never shown for failed saves
  const updatePortfolio = async (newPortfolio: PortfolioItem[]): Promise<boolean> => {
    const { error } = await portfolioService.save(profileId, newPortfolio);
    if (error) {
      setError("We couldn't save your project. Please try again.");
      return false;
    }
    return true;
  };

  const getLinkTitle = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace(/^www\./, "").split(".")[0];
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return url;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    selectMediaFiles(files);
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    selectMediaFiles(Array.from(event.dataTransfer.files || []));
  };

  const selectMediaFiles = (files: File[]) => {
    if (!files.length) return;
    const isImageGroup = files.every((file) => file.type.startsWith("image/"));
    const hasInvalidType = files.some((file) => !file.type.startsWith("image/") && file.type !== "application/pdf");
    if (hasInvalidType || (files.length > 1 && !isImageGroup)) {
      setError("Upload one PDF or group multiple images in a single portfolio item.");
      return;
    }
    if (files.reduce((total, file) => total + file.size, 0) > 20 * 1024 * 1024) {
      setError("The combined media size for each item must be 20MB or less.");
      return;
    }
    setError(null);
    setSelectedFiles(files);
    setSelectedThumbnailIndex(0);
    setProjectName((previous) => previous.trim() ? previous : files[0].name.replace(/\.[^/.]+$/, ""));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
    setSelectedThumbnailIndex(0);
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the thumbnail.");
      event.target.value = "";
      return;
    }
    const selectedSize = selectedFiles.reduce((total, selected) => total + selected.size, 0);
    if (selectedSize + file.size > 20 * 1024 * 1024) {
      setError("The combined media size for each item must be 20MB or less.");
      event.target.value = "";
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file);

    setThumbnailUploading(true);
    const ext = file.name.split('.').pop();
    const filename = `${profileId}/thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase
      .storage
      .from("portfolio")
      .upload(filename, file, { upsert: false });
    setThumbnailUploading(false);
    if (error || !data) {
      setError("Thumbnail upload failed. Please try again.");
      setThumbnailPreview(null);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from("portfolio").getPublicUrl(filename);
    setThumbnailUrl(publicUrlData.publicUrl);
  };

  // Handle project file upload (main project asset - images only)
  const handleFileUpload = async (files: File[]) => {
    setError(null);
    const isPDF = files[0]?.type === "application/pdf";
    const isImageGroup = files.length > 0 && files.every((file) => file.type.startsWith("image/"));
    if (!files.length || (!isPDF && !isImageGroup) || files.reduce((total, file) => total + file.size, 0) > 20 * 1024 * 1024) {
      setError("Add one PDF or a group of images with a combined size of 20MB or less.");
      return false;
    }
    if (portfolioList.length >= 3) {
      setError("You can add up to 3 portfolio items.");
      return false;
    }

    setUploading(true);
    setProgress(25);
    const uploadResults = await Promise.all(files.map(async (file) => {
      const ext = file.name.split(".").pop();
      const filename = `${profileId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const result = await supabase.storage.from("portfolio").upload(filename, file, { upsert: false });
      return { ...result, filename };
    }));
    const uploadedPaths = uploadResults.flatMap((result) => result.data ? [result.filename] : []);
    const uploadError = uploadResults.find((result) => result.error)?.error;
    if (uploadError) {
      if (uploadedPaths.length) await supabase.storage.from("portfolio").remove(uploadedPaths);
      setError("Media upload failed. Please try again.");
      setUploading(false);
      setProgress(0);
      return false;
    }
    setProgress(75);
    const urls = uploadResults.map(({ filename }) => supabase.storage.from("portfolio").getPublicUrl(filename).data.publicUrl);
    const url = urls[0];

    const item: PortfolioItem = {
      id: Math.random().toString(36).substring(2),
      name: projectName.trim() || files[0].name.replace(/\.[^/.]+$/, ""),
      url,
      type: isPDF ? "pdf" : "image",
      description: desc.trim().slice(0, 100),
      mediaUrls: isImageGroup ? urls : undefined,
      thumbnailUrl: thumbnailUrl || urls[selectedThumbnailIndex] || url,
      role: projectRole.trim() || undefined,
      location: projectLocation.trim() || undefined,
      projectType: projectType || undefined,
      status: projectStatus || undefined,
      year: projectYear.trim() || undefined,
    }
    const newPortfolio = [...portfolioList, item];
    const saved = await updatePortfolio(newPortfolio);
    if (!saved) {
      setUploading(false);
      setProgress(0);
      return false;
    }
    setUploading(false);
    setProgress(100);
    setOpen(false);
    setDesc("");
    setProjectRole("");
    setProjectLocation("");
    setProjectType("");
    setProjectStatus("");
    setProjectYear("");
    setSelectedFiles([]);
    setSelectedThumbnailIndex(0);
    setThumbnailUrl("");
    setThumbnailPreview(null);
    if (onPortfolioAdd) onPortfolioAdd(item);
    handleProfileUpdate();
    return true;
  };

  // Handle adding portfolio (both files and links)
  const handleAddPortfolio = async () => {
    if (!linkURL && !selectedFiles.length) return;
    if (linkURL && !isHttpUrl(linkURL)) {
      setError("Enter a valid HTTP or HTTPS link.");
      return;
    }
    
    if (portfolioList.length >= 3) {
      setError("You can add up to 3 portfolio items.");
      return;
    }
    
    setUploading(true);
    
    // Handle file upload
    if (selectedFiles.length) {
      await handleFileUpload(selectedFiles);
      return;
    }
    
    // Handle link addition
    if (linkURL) {
      const linkName = getLinkTitle(linkURL);
      const resolvedName = projectName.trim() || linkName;
      
      const item: PortfolioItem = {
        id: Math.random().toString(36).substring(2),
        name: resolvedName,
        url: linkURL,
        type: "link",
        description: desc.trim().slice(0, 100),
        thumbnailUrl: thumbnailUrl || "", // Use thumbnail if provided
        role: projectRole.trim() || undefined,
        location: projectLocation.trim() || undefined,
        projectType: projectType || undefined,
        status: projectStatus || undefined,
        year: projectYear.trim() || undefined,
      };
      const newPortfolio = [...portfolioList, item];
      const saved = await updatePortfolio(newPortfolio);
      if (!saved) {
        setUploading(false);
        return;
      }
      setOpen(false);
      setLinkURL("");
      setDesc("");
      setProjectName("");
      setProjectRole("");
      setProjectLocation("");
      setProjectType("");
      setProjectStatus("");
      setProjectYear("");
      setSelectedFiles([]);
      setSelectedThumbnailIndex(0);
      setThumbnailUrl("");
      setThumbnailPreview(null);
      if (onPortfolioAdd) onPortfolioAdd(item);
      handleProfileUpdate();
    }
    
    setUploading(false);
  };

  // Updated validation logic - only one item at a time
  const hasFile = selectedFiles.length > 0;
  const hasLink = linkURL.trim() !== "";
  const hasBothInputs = hasFile && hasLink;
  const hasValidInput = (hasFile || hasLink) && !hasBothInputs && (!hasLink || isHttpUrl(linkURL));

  // Reset form when dialog closes
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setLinkURL("");
      setDesc("");
      setProjectName("");
      setProjectRole("");
      setProjectLocation("");
      setProjectType("");
      setProjectStatus("");
      setProjectYear("");
      setSelectedFiles([]);
      setSelectedThumbnailIndex(0);
      setThumbnailUrl("");
      setThumbnailPreview(null);
      setError(null);
      setProgress(0);
      if (fileInput.current) {
        fileInput.current.value = '';
      }
      if (thumbnailInput.current) {
        thumbnailInput.current.value = '';
      }
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={disabled ? () => {} : handleDialogClose}>
      <DialogTrigger asChild>
        {asIconButton ? (
          <Button variant="ghost" size="sm" className="px-2" disabled={disabled} aria-label="Add to Portfolio">
            <Plus className="h-4 w-4" />
          </Button>
        ) : null}
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-xl p-4 sm:p-6">
        <DialogHeader className="mb-1">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BadgePlus className="h-5 w-5 text-primary shrink-0" />
            Add New Portfolio Project
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Upload images or PDFs, or link to an external project. Add a title and optional thumbnail.
          </DialogDescription>
        </DialogHeader>

        {/* ── Upload drop-zone ── */}
        <div className="mt-2">
          <label className="block text-sm font-semibold mb-1.5 text-foreground">
            Upload an Image or PDF
          </label>

          {/* Drop zone */}
          <div
            className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors cursor-pointer
              ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"}
              ${selectedFiles.length ? "bg-muted/30" : ""}
              ${uploading || disabled ? "pointer-events-none opacity-50" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => !selectedFiles.length && fileInput.current?.click()}
          >
            <input
              title="Upload an Image/Document"
              type="file"
              accept="image/*,.pdf"
              multiple
              ref={fileInput}
              onChange={handleFileChange}
              disabled={uploading || disabled}
              className="sr-only"
            />

            {selectedFiles.length ? (
              <div className="w-full space-y-2 text-left">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeSelectedFile(index); }}
                  disabled={uploading || disabled}
                  className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label="Remove selected file"
                >
                  <X className="h-4 w-4" />
                </button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  {selectedFiles.length > 1 ? `${selectedFiles.length} images grouped as one item · ` : ""}
                  {(selectedFiles.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB of 20 MB
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    <span className="text-primary">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Images or PDF — max 20 MB per item</p>
                </div>
              </>
            )}
          </div>

          {(progress > 0 && progress < 99) && (
            <Progress value={progress} className="mt-2" />
          )}

          {portfolioList.length >= 3 && (
            <p className="mt-1.5 text-xs text-destructive">Portfolio limit reached (3/3). Remove an item to add a new one.</p>
          )}
          {portfolioList.length > 0 && portfolioList.length < 3 && (
            <p className="mt-1.5 text-xs text-blue-500 dark:text-blue-400">{portfolioList.length} items uploaded</p>
          )}
        </div>

        {/* ── Project name — shown as soon as a file or link is present ── */}
        {selectedFiles.length > 0 && selectedFiles.every((file) => file.type.startsWith("image/")) && (
          <div className="grid grid-cols-3 gap-2">
            {selectedPreviews.map((preview, index) => (
              <button
                key={preview}
                type="button"
                className={`relative overflow-hidden rounded-md border-2 ${selectedThumbnailIndex === index ? "border-primary" : "border-border"}`}
                onClick={() => setSelectedThumbnailIndex(index)}
                aria-label={`Choose ${selectedFiles[index]?.name} as cover image`}
                aria-pressed={selectedThumbnailIndex === index}>
                <img src={preview} alt="" className="h-20 w-full object-cover" />
                {selectedThumbnailIndex === index && <span className="absolute inset-x-0 bottom-0 bg-primary/90 px-1 text-xs text-primary-foreground">Cover</span>}
              </button>
            ))}
          </div>
        )}
        {selectedFiles.length === 1 && selectedFiles[0].type === "application/pdf" && selectedPreviews[0] && (
          <iframe src={selectedPreviews[0]} title={`Preview ${selectedFiles[0].name}`} className="h-48 w-full rounded-md border" />
        )}

        {linkURL.trim() && isHttpUrl(linkURL) && (
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Link preview</p>
            <a className="break-all text-sm text-primary underline" href={linkURL} target="_blank" rel="noreferrer">{projectName || linkURL}</a>
            {desc && <p className="mt-1 text-sm text-muted-foreground">{desc.slice(0, 100)}</p>}
          </div>
        )}

        {(selectedFiles.length > 0 || linkURL.trim() !== "") && (
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={selectedFiles.length ? selectedFiles[0].name.replace(/\.[^/.]+$/, "") : "e.g., My Project"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={uploading || disabled}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">This name appears on your portfolio card.</p>
          </div>
        )}

        {/* ── Project details (optional but high-value) ── */}
        {(selectedFiles.length > 0 || linkURL.trim() !== "") && (
          <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-sm font-semibold text-foreground">
              Project details <span className="font-normal text-muted-foreground">(optional — helps you get discovered)</span>
            </p>

            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What did you deliver on this project? What was the outcome?"
              rows={2}
              maxLength={100}
              className={`${inputClass} h-20 resize-y`}
              disabled={uploading || disabled}
            />

            <input
              type="text"
              value={projectRole}
              onChange={(e) => setProjectRole(e.target.value)}
              placeholder="Your role — e.g. Project Coordinator"
              maxLength={60}
              className={inputClass}
              disabled={uploading || disabled}
            />

            <input
              type="text"
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
              placeholder="Location — e.g. Nairobi, Kenya"
              maxLength={80}
              className={inputClass}
              disabled={uploading || disabled}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className={inputClass}
                disabled={uploading || disabled}
                aria-label="Project discipline">
                <option value="">Project discipline</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
                className={inputClass}
                disabled={uploading || disabled}
                aria-label="Project status">
                <option value="">Status</option>
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={projectYear}
              onChange={(e) => setProjectYear(e.target.value)}
              placeholder="Year — e.g. 2025"
              maxLength={20}
              className={inputClass}
              disabled={uploading || disabled}
            />
          </div>
        )}

        {/* ── Thumbnail upload section ── */}
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-1.5 text-foreground">
            Custom Thumbnail <span className="font-normal text-muted-foreground">(optional)</span>
          </label>

          <div className="flex items-start gap-3">
            {/* Preview box */}
            <div
              className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer
                ${thumbnailPreview ? "border-transparent" : "border-border hover:border-primary/50"}
                ${thumbnailUploading ? "opacity-60 pointer-events-none" : ""}
                ${uploading || disabled ? "pointer-events-none opacity-50" : ""}`}
              onClick={() => thumbnailInput.current?.click()}
            >
              <input
                title="Upload a Thumbnail"
                type="file"
                accept="image/*"
                ref={thumbnailInput}
                onChange={handleThumbnailUpload}
                disabled={uploading || disabled || thumbnailUploading}
                className="sr-only"
              />
              {thumbnailPreview ? (
                <>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-full w-full rounded-lg object-cover"
                  />
                  {/* Remove thumbnail overlay */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setThumbnailUrl(""); setThumbnailPreview(null); }}
                    disabled={uploading || disabled}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-white shadow-sm disabled:opacity-50"
                    aria-label="Remove thumbnail"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {thumbnailUploading ? (
                <p className="text-sm text-muted-foreground">Uploading thumbnail…</p>
              ) : thumbnailPreview ? (
                <p className="text-sm text-foreground font-medium">Thumbnail set</p>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={uploading || disabled || thumbnailUploading}
                  onClick={() => thumbnailInput.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload image
                </Button>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                If not set, the uploaded image is used as thumbnail.
              </p>
            </div>
          </div>
        </div>

        {/* ── Link input ── */}
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-1.5 text-foreground">Or add a project link</label>
          <input
            type="url"
            value={linkURL}
            onChange={e => setLinkURL(e.target.value)}
            placeholder="https://yourproject.com"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={uploading || disabled}
          />
          <p className="text-xs text-muted-foreground mt-1">
            GitHub, Behance, live website, etc.
          </p>
        </div>
      
        {hasBothInputs && (
          <p className="text-destructive text-xs mt-2">
            Please choose either a file or a link — not both.
          </p>
        )}

        {error && <p className="text-destructive text-sm mt-2">{error}</p>}

        <DialogFooter className="mt-4 flex-col-reverse gap-2 sm:flex-row sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={uploading || disabled} className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleAddPortfolio}
            type="button"
            disabled={!hasValidInput || uploading || disabled}
            variant="default"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Portfolio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioEditorDialog;
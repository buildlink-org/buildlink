import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, BadgePlus, X, Image as ImageIcon, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";


type PortfolioItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  description?: string;
  thumbnailUrl?: string;
};

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
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const thumbnailInput = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);


  const updatePortfolio = async (newPortfolio: PortfolioItem[]) => {
    await supabase
      .from("profiles")
      .update({ portfolio: newPortfolio })
      .eq("id", profileId);
  };

  // Fast meta title fetching with timeout
  const fetchMetaTitle = async (url: string): Promise<string> => {
    try {
      // Use a reliable CORS proxy with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          const title = titleMatch[1].trim();
          // Clean up common title suffixes
          return title.replace(/\s*[-|â€"].*$/, '').trim() || title;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch meta title:', error);
    }
    
    // Fallback: extract domain name from URL for a cleaner display
    try {
      const urlObj = new URL(url);
      let domain = urlObj.hostname.replace('www.', '');
      // Capitalize first letter and remove TLD for cleaner display
      domain = domain.split('.')[0];
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return url;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files && files.length > 0 ? files[0] : null;
    setSelectedFile(file);
    if (file) {
      setProjectName((prev) => (prev.trim() ? prev : file.name.replace(/\.[^/.]+$/, "")));
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    setSelectedFile(file);
    setProjectName((prev) => (prev.trim() ? prev : file.name.replace(/\.[^/.]+$/, "")));
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    setProjectName("");
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

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
    if (error || !data) return;
    const { data: publicUrlData } = supabase.storage.from("portfolio").getPublicUrl(filename);
    setThumbnailUrl(publicUrlData.publicUrl);
  };

  // Handle project file upload (main project asset - images only)
  const handleFileUpload = async (file: File) => {
    setError(null);
    
    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'

    if (!isImage && !isPDF) {
      setError("Only image or PDF files are allowed.")
      return false
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be 10MB or less.")
      return false
    }
    // Check portfolio limit
    if (portfolioList.length >= 3) {
      setError("You can only upload up to 3 portfolio items.");
      return false;
    }

    const ext = file.name.split(".").pop();
    const filename = `${profileId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    setUploading(true);
    setProgress(50);

    const { data, error: uploadError } = await supabase
      .storage
      .from("portfolio")
      .upload(filename, file, { upsert: false });
    if (uploadError) {
      setError("Upload failed");
      setUploading(false);
      setProgress(0);
      return false;
    }

    const { data: publicUrlData } = supabase.storage.from("portfolio").getPublicUrl(filename);
    const url = publicUrlData.publicUrl;

    const item: PortfolioItem = {
      id: Math.random().toString(36).substring(2),
      name: projectName.trim() || file.name.replace(/\.[^/.]+$/, ""),
      url,
      type: isPDF ? "pdf" : "image",
      description: desc,
      thumbnailUrl: isPDF ? thumbnailUrl || "" : thumbnailUrl || url,
    }
    const newPortfolio = [...portfolioList, item];
    await updatePortfolio(newPortfolio);
    setUploading(false);
    setProgress(100);
    setOpen(false);
    setDesc("");
    setSelectedFile(null);
    setThumbnailUrl("");
    setThumbnailPreview(null);
    if (onPortfolioAdd) onPortfolioAdd(item);
    handleProfileUpdate();
    return true;
  };

  // Handle adding portfolio (both files and links)
  const handleAddPortfolio = async () => {
    if (!linkURL && !selectedFile) return;
    
    // Check portfolio limit
    if (portfolioList.length >= 3) {
      setError("You can only upload up to 3 portfolio items.");
      return;
    }
    
    setUploading(true);
    
    // Handle file upload
    if (selectedFile) {
      await handleFileUpload(selectedFile);
      return;
    }
    
    // Handle link addition
    if (linkURL) {
      // Fetch meta title with timeout
      const linkName = await fetchMetaTitle(linkURL);
      const resolvedName = projectName.trim() || linkName;
      
      const item: PortfolioItem = {
        id: Math.random().toString(36).substring(2),
        name: resolvedName,
        url: linkURL,
        type: "link",
        description: desc,
        thumbnailUrl: thumbnailUrl || "", // Use thumbnail if provided
      };
      const newPortfolio = [...portfolioList, item];
      await updatePortfolio(newPortfolio);
      setOpen(false);
      setLinkURL("");
      setDesc("");
      setProjectName("");
      setSelectedFile(null);
      setThumbnailUrl("");
      setThumbnailPreview(null);
      if (onPortfolioAdd) onPortfolioAdd(item);
      handleProfileUpdate();
    }
    
    setUploading(false);
  };

  // Updated validation logic - only one item at a time
  const hasFile = selectedFile !== null;
  const hasLink = linkURL.trim() !== "";
  const hasBothInputs = hasFile && hasLink;
  const hasValidInput = (hasFile || hasLink) && !hasBothInputs;

  // Reset form when dialog closes
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setLinkURL("");
      setDesc("");
      setProjectName("");
      setSelectedFile(null);
      setThumbnailUrl("");
      setThumbnailPreview(null);
      setError(null);
      setProgress(0);
      if (fileInput.current) {
        fileInput.current.value = '';
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
              ${selectedFile ? "bg-muted/30" : ""}
              ${uploading || disabled ? "pointer-events-none opacity-50" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => !selectedFile && fileInput.current?.click()}
          >
            <input
              title="Upload an Image/Document"
              type="file"
              accept="image/*, .pdf"
              ref={fileInput}
              onChange={handleFileChange}
              disabled={uploading || disabled}
              className="sr-only"
            />

            {selectedFile ? (
              <div className="flex w-full items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleFileDelete(); }}
                  disabled={uploading || disabled}
                  className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  aria-label="Remove selected file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    <span className="text-primary">Click to upload</span> or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, GIF, WebP, PDF — max 10 MB</p>
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
            <p className="mt-1.5 text-xs text-blue-500 dark:text-blue-400">{portfolioList.length}/3 items uploaded</p>
          )}
        </div>

        {/* ── Project name — shown as soon as a file or link is present ── */}
        {(selectedFile || linkURL.trim() !== "") && (
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1.5 text-foreground">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "e.g., My Project"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={uploading || disabled}
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground mt-1">This name appears on your portfolio card.</p>
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
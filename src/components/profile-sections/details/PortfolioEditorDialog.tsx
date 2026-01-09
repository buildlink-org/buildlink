import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Link2, Plus, BadgePlus, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { getType } from "./getPortfolioFileType";
import { Badge } from "@/components/ui/badge";

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
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");


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
          return title.replace(/\s*[-|â€"]\s*.*$/, '').trim() || title;
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
    setSelectedFile(files && files.length > 0 ? files[0] : null);
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };
  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

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
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setError("Only image files are allowed. Please upload a JPG, PNG, or GIF file.");
      return false;
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
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension from name
      url,
      type: "image",
      description: desc,
      thumbnailUrl: thumbnailUrl || url, // Use thumbnail if provided, otherwise use main image
    };
    const newPortfolio = [...portfolioList, item];
    await updatePortfolio(newPortfolio);
    setUploading(false);
    setProgress(100);
    setOpen(false);
    setDesc("");
    setSelectedFile(null);
    setThumbnailUrl("");
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
      
      const item: PortfolioItem = {
        id: Math.random().toString(36).substring(2),
        name: linkName,
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
      setSelectedFile(null);
      setThumbnailUrl("");
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
      setSelectedFile(null);
      setThumbnailUrl("");
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgePlus className="h-5 w-5 text-primary" />
            Add New Portfolio Project
          </DialogTitle>
          <DialogDescription>
            Share your best work—upload images or add accessible project links. You can also choose custom thumbnails.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <label className="block font-semibold mb-1">Upload an Image</label>
          <div className="flex items-center gap-2">
            <input
              title="Upload an Image"
              type="file"
              accept="image/*"
              ref={fileInput}
              onChange={handleFileChange}
              disabled={uploading || disabled}
              className="block disabled:opacity-50 flex-1"
            />
            {selectedFile && (
              <button
                type="button"
                onClick={handleFileDelete}
                disabled={uploading || disabled}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                aria-label="Remove selected file"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {selectedFile && (
            <div className="text-sm text-gray-600 mt-1">
              Selected: {selectedFile.name}
            </div>
          )}
          {(progress > 0 && progress < 99) && (
            <Progress value={progress} className="mt-2" />
          )}
          <div className="text-xs text-gray-500 mt-1 mb-2">
            Max 10MB. Image files only (JPG, PNG, GIF, WebP).
            {portfolioList.length >= 3 && (
              <div className="text-red-600 mt-1">Portfolio limit reached (3/3). Remove existing items to upload new ones.</div>
            )}
            {portfolioList.length < 3 && portfolioList.length > 0 && (
              <div className="text-blue-600 mt-1">Items uploaded: {portfolioList.length}/3</div>
            )}
          </div>
        </div>
        
        {/* Thumbnail upload section */}
        <div className="mt-4">
          <label className="block font-semibold mb-1">Choose Thumbnail (Optional)</label>
          <div className="flex items-center gap-2">
            <input
              title="Upload a Thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              disabled={uploading || disabled || thumbnailUploading}
              className="block disabled:opacity-50 flex-1"
            />
            {thumbnailUrl && (
              <button
                type="button"
                onClick={() => setThumbnailUrl("")}
                disabled={uploading || disabled}
                className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1"
                aria-label="Remove thumbnail"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {thumbnailUploading && (
            <div className="text-sm text-gray-600 mt-1">Uploading thumbnail...</div>
          )}
          {thumbnailUrl && !thumbnailUploading && (
            <div className="mt-2">
              <img 
                src={thumbnailUrl} 
                alt="Thumbnail preview" 
                className="w-32 h-32 object-cover rounded-md border border-gray-200"
              />
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Optional: Upload a custom thumbnail for this project. If not provided, the main image will be used.
          </div>
        </div>
        <div className="mt-4">
          <label className="block font-semibold mb-1">Or add a project link</label>
          <input
            type="url"
            value={linkURL}
            onChange={e => setLinkURL(e.target.value)}
            placeholder="https://yourproject.com"
            className="px-2 py-1 border rounded w-full"
            disabled={uploading || disabled}
          />
          <div className="text-xs text-gray-500 mt-1">
            Add an accessible link to your project (e.g., GitHub, Behance, live website).
          </div>
        </div>
      
        {hasBothInputs && (
          <div className="text-red-500 text-sm mt-1">
            Only upload one portfolio item at a time
          </div>
        )}

        {error && <div className="text-red-500 mt-2">{error}</div>}
        <DialogFooter className="mt-1">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={uploading || disabled}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleAddPortfolio}
            type="button"
            disabled={!hasValidInput || uploading || disabled}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Portfolio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioEditorDialog;
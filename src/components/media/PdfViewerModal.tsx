import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ExternalLink,
  Eye,
  SlidersHorizontal,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { getFilenameFromUrl } from "@/lib/utils";

export interface PdfViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  name?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  open,
  onOpenChange,
  url,
  name,
}) => {
  const [viewMode, setViewMode] = useState<"clean" | "tools">("clean");
  const [fitMode, setFitMode] = useState<"FitH" | "Fit">("FitH");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const documentName = useMemo(() => {
    return name || getFilenameFromUrl(url) || "PDF Document.pdf";
  }, [name, url]);

  // Strip existing fragments and append clean parameters
  const iframeSrc = useMemo(() => {
    if (!url) return "";
    const cleanUrl = url.split("#")[0];

    if (viewMode === "clean") {
      // Hides default browser plugin black bar & side panel for a clean presentation
      return `${cleanUrl}#toolbar=0&navpanes=0&scrollbar=1&view=${fitMode}`;
    } else {
      // Enables native browser PDF toolbar when requested
      return `${cleanUrl}#toolbar=1&navpanes=0&scrollbar=1&view=${fitMode}`;
    }
  }, [url, viewMode, fitMode]);

  const handleOpenNewTab = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!url) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-6xl w-[96vw] h-[92vh] md:h-[94vh] p-0 flex flex-col overflow-hidden rounded-xl border shadow-2xl bg-background"
        description={`Presentable reader for ${documentName}`}
      >
        {/* Presentable Document Header with clearance for close button */}
        <DialogHeader className="px-3 sm:px-4 py-2.5 sm:py-3 border-b flex-row items-center justify-between space-y-0 shrink-0 bg-muted/30 pr-10 sm:pr-12">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1 mr-2 sm:mr-4">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xs sm:text-sm font-semibold truncate text-foreground flex items-center gap-2">
                <span className="truncate">{documentName}</span>
              </DialogTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0 h-4 font-medium uppercase tracking-wider">
                  PDF Reader
                </Badge>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">•</span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  {viewMode === "clean" ? "Clean Reading Mode" : "Native Browser Tools"}
                </span>
              </div>
            </div>
          </div>

          {/* Presenter Controls Toolbar */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
            {/* View Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                setViewMode((prev) => (prev === "clean" ? "tools" : "clean"));
              }}
              className="h-7 sm:h-8 px-2 text-xs gap-1 hidden sm:flex"
              title={viewMode === "clean" ? "Show browser PDF toolbar" : "Switch to clean presentation view"}
              aria-label="Toggle view mode"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>{viewMode === "clean" ? "Native Tools" : "Clean View"}</span>
            </Button>

            {/* Fit Width / Fit Page toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                setFitMode((prev) => (prev === "FitH" ? "Fit" : "FitH"));
              }}
              className="h-7 sm:h-8 px-2 text-xs gap-1 hidden md:flex"
              title="Toggle page fit mode"
              aria-label="Toggle fit mode"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>{fitMode === "FitH" ? "Fit Width" : "Fit Page"}</span>
            </Button>

            {/* Open in New Tab Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenNewTab}
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-xs gap-1.5"
              title="Open in New Tab"
              aria-label="Open in New Tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Paper-like Document Viewport */}
        <div className="flex-1 min-h-0 relative bg-slate-100 dark:bg-slate-900/80 p-1 sm:p-3 md:p-4 flex items-center justify-center overflow-hidden">
          {isLoading && !hasError && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm gap-3">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-primary"></div>
              <p className="text-xs text-muted-foreground font-medium animate-pulse">
                Preparing document reader…
              </p>
            </div>
          )}

          {hasError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md bg-card rounded-xl border shadow-sm">
              <FileText className="h-12 w-12 text-destructive mb-3" />
              <h4 className="font-semibold text-sm mb-1">Unable to preview document inline</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Your browser may restrict inline PDF rendering for this source.
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleOpenNewTab} className="gap-1.5 text-xs">
                  <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full max-w-5xl rounded-lg overflow-hidden border border-border/80 shadow-lg bg-card">
              <iframe
                key={iframeSrc}
                src={iframeSrc}
                className="w-full h-full border-0"
                title={documentName}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setHasError(true);
                  setIsLoading(false);
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default PdfViewerModal;

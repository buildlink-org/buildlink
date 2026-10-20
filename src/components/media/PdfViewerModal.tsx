import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
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
  Maximize2,
  ChevronLeft,
  ChevronRight,
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
  const [fitMode, setFitMode] = useState<"FitH" | "Fit">("FitH");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const documentName = useMemo(() => {
    return name || getFilenameFromUrl(url) || "PDF Document.pdf";
  }, [name, url]);

  const handleOpenNewTab = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!open || !viewport) return;

    const updateSize = () => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [open, pdf]);

  useEffect(() => {
    if (!open || !url) return;

    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | undefined;
    setIsLoading(true);
    setHasError(false);
    setErrorMessage("");
    setPdf(null);
    setPageNumber(1);
    setPageCount(0);

    const loadPdf = async () => {
      try {
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        if (cancelled) return;
        GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        loadingTask = getDocument({ url });
        const document = await loadingTask.promise;
        if (cancelled) {
          await document.destroy();
          return;
        }
        setPdf(document);
        setPageCount(document.numPages);
      } catch (error) {
        if (cancelled) return;
        console.error("[PdfViewerModal] Failed to load PDF:", error);
        setErrorMessage("Your browser could not load this PDF for preview.");
        setHasError(true);
        setIsLoading(false);
      }
    };

    void loadPdf();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      void loadingTask?.destroy();
    };
  }, [open, url]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!open || !pdf || !canvas || !viewportSize.width || !viewportSize.height) return;

    let cancelled = false;
    setIsLoading(true);
    setHasError(false);

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const padding = 32;
        const availableWidth = Math.max(1, viewportSize.width - padding);
        const availableHeight = Math.max(1, viewportSize.height - padding);
        const scale =
          fitMode === "FitH"
            ? availableWidth / baseViewport.width
            : Math.min(
                availableWidth / baseViewport.width,
                availableHeight / baseViewport.height,
              );
        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.ceil(viewport.width * outputScale);
        canvas.height = Math.ceil(viewport.height * outputScale);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas rendering is unavailable.");

        const task = page.render({
          canvasContext: context,
          viewport,
          transform:
            outputScale === 1
              ? undefined
              : [outputScale, 0, 0, outputScale, 0, 0],
        });
        renderTaskRef.current = task;
        await task.promise;
        if (!cancelled) setIsLoading(false);
      } catch (error) {
        if (cancelled) return;
        console.error("[PdfViewerModal] Failed to render PDF page:", error);
        setErrorMessage("This PDF page could not be rendered.");
        setHasError(true);
        setIsLoading(false);
      }
    };

    void renderPage();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [fitMode, open, pageNumber, pdf, viewportSize]);

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
                  {pageCount > 0 ? `${pageCount} pages` : "Loading document"}
                </span>
              </div>
            </div>
          </div>

          {/* Presenter Controls Toolbar */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
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
        <div
          ref={viewportRef}
          className="flex-1 min-h-0 relative bg-slate-100 dark:bg-slate-900/80 p-1 sm:p-3 md:p-4 flex items-center justify-center overflow-auto"
        >
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
                {errorMessage}
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleOpenNewTab} className="gap-1.5 text-xs">
                  <ExternalLink className="h-3.5 w-3.5" /> Open in New Tab
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-full w-full items-center justify-center py-2">
              <canvas
                ref={canvasRef}
                aria-label={`${documentName}, page ${pageNumber} of ${pageCount}`}
                className="max-w-full rounded-lg border border-border/80 bg-card shadow-lg"
              />
              {pdf && pageCount > 1 && (
                <div className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur sm:absolute sm:bottom-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Previous PDF page"
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-20 text-center text-xs text-muted-foreground" aria-live="polite">
                    Page {pageNumber} of {pageCount}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Next PDF page"
                    disabled={pageNumber >= pageCount}
                    onClick={() => setPageNumber((current) => Math.min(pageCount, current + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default PdfViewerModal;

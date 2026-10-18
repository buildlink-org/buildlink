import { useEffect, useRef, useState } from "react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react";

interface PdfPageThumbnailSelectorProps {
  file: File;
  selectedPage?: number;
  onPageRendered: (
    page: number,
    pageCount: number,
    previewUrl: string,
    thumbnailFile: File,
  ) => void;
  onSelectPage: (
    page: number,
    previewUrl: string,
    thumbnailFile: File,
  ) => void;
}

export const PdfPageThumbnailSelector = ({
  file,
  selectedPage,
  onPageRendered,
  onSelectPage,
}: PdfPageThumbnailSelectorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const onPageRenderedRef = useRef(onPageRendered);
  onPageRenderedRef.current = onPageRendered;
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pageNumber, setPageNumber] = useState(selectedPage ?? 1);
  const [pageCount, setPageCount] = useState(0);
  const [renderedPage, setRenderedPage] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | undefined;

    const loadPdf = async () => {
      try {
        const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
        if (cancelled) return;
        GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
        loadingTask = getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
        const pdf = await loadingTask.promise;
        if (cancelled) {
          await pdf.destroy();
          return;
        }
        documentRef.current = pdf;
        setPageCount(pdf.numPages);
        setPageNumber((current) => Math.min(current, pdf.numPages));
        setPdfLoaded(true);
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          console.error("[PdfPageThumbnailSelector] Failed to load PDF preview:", loadError);
          setError("This PDF could not be previewed. It can still be attached to the post.");
        }
      }
    };

    void loadPdf();
    return () => {
      cancelled = true;
      documentRef.current = null;
      void loadingTask?.destroy();
    };
  }, [file]);

  useEffect(() => {
    const pdf = documentRef.current;
    const canvas = canvasRef.current;
    if (!pdfLoaded || !pdf || !canvas || pageNumber < 1 || pageNumber > pdf.numPages) return;

    let cancelled = false;
    const renderPage = async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        const unscaledViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({
          scale: Math.min(1, 640 / unscaledViewport.width),
        });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas rendering is unavailable.");

        const task = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = task;
        await task.promise;
        if (cancelled) return;

        const preview = canvas.toDataURL("image/png");
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (!blob) throw new Error("Could not create a thumbnail from this PDF page.");
        if (cancelled) return;

        const baseName = file.name.replace(/\.pdf$/i, "");
        const thumbnail = new File([blob], `${baseName}-page-${pageNumber}.png`, {
          type: "image/png",
        });
        setPreviewUrl(preview);
        setThumbnailFile(thumbnail);
        setRenderedPage(pageNumber);
        setError(null);
        onPageRenderedRef.current(pageNumber, pdf.numPages, preview, thumbnail);
      } catch (renderError) {
        if (!cancelled) {
          console.error("[PdfPageThumbnailSelector] Failed to render PDF page:", renderError);
          setError("This PDF page could not be previewed.");
        }
      }
    };

    void renderPage();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [file, pageNumber, pdfLoaded]);

  const isSelected = selectedPage === pageNumber;

  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        PDF page preview
      </p>
      {error ? (
        <p role="alert" className="text-xs text-destructive">{error}</p>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-md border bg-white p-2 dark:bg-slate-950">
          <canvas
            ref={canvasRef}
            aria-label={`PDF page ${pageNumber} preview`}
            className="max-h-64 max-w-full object-contain"
          />
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous PDF page"
              disabled={pageNumber <= 1 || pageCount === 0}
              onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span aria-live="polite" className="text-xs text-muted-foreground">
              Page {pageNumber}{pageCount ? ` of ${pageCount}` : ""}
              {selectedPage ? ` · Thumbnail: page ${selectedPage}` : ""}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next PDF page"
              disabled={pageNumber >= pageCount || pageCount === 0}
              onClick={() => setPageNumber((current) => Math.min(pageCount, current + 1))}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full gap-1.5"
            disabled={!previewUrl || !thumbnailFile || renderedPage !== pageNumber}
            onClick={() => {
              if (thumbnailFile) onSelectPage(pageNumber, previewUrl, thumbnailFile);
            }}
          >
            {isSelected ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
            {isSelected ? "Selected as post thumbnail" : "Use this page as post thumbnail"}
          </Button>
        </div>
      )}
    </div>
  );
};

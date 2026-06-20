import React, { useEffect, useState } from "react";
import { Image, FileText, ExternalLink } from "lucide-react";
import { Button } from "./button";
import { cn, getFilenameFromUrl } from "@/lib/utils";

interface MediaPreviewProps {
  url: string;
  type: "image" | "pdf" | "video" | "document";
  name?: string;
  size?: "sm" | "md" | "lg";
  showActions?: boolean;
  thumbnailUrl?: string;
  className?: string;
}

const MediaPreview = ({
  url,
  type,
  name,
  size = "md",
  showActions = true,
  thumbnailUrl,
  className,
}: MediaPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [url]);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-full h-32",
    lg: "w-full h-48",
  };

  const getFileIcon = () => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "image":
        return <Image className="h-8 w-8 text-blue-500" />;
      case "video":
        return <Image className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };


  const renderPdfViewer = () => {
    if (hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-20 w-20 text-gray-400 mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Cannot Display PDF
          </h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            There was an error loading this PDF. Please try opening it in a new tab.
          </p>
          <div>
            <Button
              variant="outline"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-white rounded-lg border overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}
        <iframe
          src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-full border-0"
          key={url}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          title={name || getFilenameFromUrl(url)}
          allow="fullscreen"
        />
      </div>
    );
  };

  if (type === "pdf") {
    return (
      <div className={cn("relative group", className)}>
        <div className="flex flex-col h-full">
          {showActions && (
            <div className="mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold">
                {name || getFilenameFromUrl(url) || "PDF Document"}
              </h3>
            </div>
          )}
          <div className="flex-1 min-h-0">
            {renderPdfViewer()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
    </div>
  );
};

export default MediaPreview;
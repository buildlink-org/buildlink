import React, { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Download, X, ChevronLeft, ChevronRight } from "lucide-react"
import { downloadFile, getFilenameFromUrl } from "@/lib/utils"

interface MediaLightboxProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  alt?: string
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
  alt = "Post image",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      setZoom(1)
      setPan({ x: 0, y: 0 })
    }
  }, [open, initialIndex])

  const handleNext = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      setZoom(1)
      setPan({ x: 0, y: 0 })
    }
  }, [images.length])

  const handlePrev = useCallback(() => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      setZoom(1)
      setPan({ x: 0, y: 0 })
    }
  }, [images.length])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 4))
  }

  const handleZoomOut = () => {
    setZoom((prev) => {
      const nextZoom = Math.max(prev - 0.5, 1)
      if (nextZoom === 1) setPan({ x: 0, y: 0 })
      return nextZoom
    })
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleDownload = async () => {
    const currentUrl = images[currentIndex]
    if (!currentUrl) return
    const fileName = getFilenameFromUrl(currentUrl) || `image-${Date.now()}.jpg`
    await downloadFile(currentUrl, fileName)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, handleNext, handlePrev, onOpenChange])

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (!open || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none text-white flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Top Controls Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="text-sm font-medium text-gray-300">
            {images.length > 1 && `${currentIndex + 1} / ${images.length}`}
          </div>

          <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-md rounded-full px-3 py-1 border border-white/10">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={handleZoomOut} disabled={zoom <= 1} title="Zoom out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-gray-300 px-1 font-mono">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={handleZoomIn} disabled={zoom >= 4} title="Zoom in">
              <ZoomIn className="h-4 w-4" />
            </Button>

            {zoom > 1 && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={handleReset} title="Reset zoom">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            <div className="h-4 w-[1px] bg-white/20 mx-1" />

            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={handleDownload} title="Download image">
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/20 rounded-full" onClick={() => onOpenChange(false)} title="Close (Esc)">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Viewport */}
        <div
          className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={currentImage}
            alt={alt}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
            }}
            className="max-h-[85vh] max-w-[90vw] object-contain pointer-events-none rounded"
          />

          {/* Left Arrow */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 z-40 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
            >
              <ChevronLeft className="h-7 w-7" />
            </Button>
          )}

          {/* Right Arrow */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 z-40 backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
            >
              <ChevronRight className="h-7 w-7" />
            </Button>
          )}
        </div>

        {/* Bottom Thumbnail Strip (for multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 max-w-[80vw] overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx)
                  setZoom(1)
                  setPan({ x: 0, y: 0 })
                }}
                className={`relative w-10 h-10 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                  idx === currentIndex ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MediaLightbox

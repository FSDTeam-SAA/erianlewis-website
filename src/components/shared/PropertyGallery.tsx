"use client"

import { useMemo, useState } from "react"

import { ChevronLeft, ChevronRight, Images, Play } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PropertyGalleryProps {
  images: string[]
  totalCount: number
}

const isVideoUrl = (url?: string) => Boolean(url && /\.(mp4|webm|ogg|mov)$/i.test(url))

const wrapIndex = (index: number, length: number) => {
  if (!length) return 0
  return (index + length) % length
}

export function PropertyGallery({ images, totalCount }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewerOpen, setViewerOpen] = useState(false)

  const activeMedia = images[selectedIndex]
  const activeIsVideo = isVideoUrl(activeMedia)
  const hasMultipleImages = images.length > 1

  const viewerItems = useMemo(() => images.map((media, index) => ({ media, index })), [images])

  const goToNext = () => setSelectedIndex(current => wrapIndex(current + 1, images.length))
  const goToPrevious = () => setSelectedIndex(current => wrapIndex(current - 1, images.length))

  const renderMedia = (media: string | undefined, className = "", priority = false) => {
    if (!media) return null

    if (isVideoUrl(media)) {
      return (
        <video
          src={media}
          className={className}
          controls
          playsInline
          preload="metadata"
        />
      )
    }

    return (
      <Image
        src={media}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
        alt="Property Image"
        className={className}
      />
    )
  }

  return (
    <>
      <div>
        <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm group sm:h-[380px] md:h-[480px] lg:h-[560px]">
          {images.length > 0 && activeMedia ? (
            activeIsVideo ? (
              <video
                src={activeMedia}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <Image
                src={activeMedia}
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                alt="Property Image"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )
          ) : null}

          <div className="pointer-events-none absolute inset-0 bg-black/10" />

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[#202124] shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition-transform hover:scale-105 hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[#202124] shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition-transform hover:scale-105 hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          {totalCount > 0 ? (
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/80"
            >
              <Images className="h-3.5 w-3.5" />
              View All {totalCount} Photos
            </button>
          ) : null}

          <div className="absolute right-4 top-4 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-bold tracking-wide text-white backdrop-blur-md shadow-sm">
            {Math.min(selectedIndex + 1, Math.max(totalCount, 1))}/{Math.max(totalCount, 1)}
          </div>
        </div>

        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
          {images.slice(0, 8).map((img, index) => (
            <button
              type="button"
              key={`${img}-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-[52px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 bg-gray-100 shadow-sm transition-colors ${
                selectedIndex === index
                  ? "border-blue-400"
                  : "border-transparent hover:border-blue-400"
              }`}
            >
              {isVideoUrl(img) ? (
                <>
                  <video
                    src={img}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <Play className="h-4 w-4 text-white" />
                  </span>
                </>
              ) : (
                <Image
                  src={img}
                  fill
                  alt={`Thumbnail ${index + 1}`}
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-[1100px] rounded-[28px] border border-white/80 bg-[#0f172a] p-0 text-white shadow-[0_30px_90px_rgba(15,23,42,0.5)]">
          <div className="p-4 sm:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-semibold text-white">
                Property photos
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-300">
                Browse all uploaded photos with next and previous controls.
              </DialogDescription>
            </DialogHeader>

            <div className="relative overflow-hidden rounded-[24px] bg-black/20">
              <div className="relative h-[56vh] min-h-[340px] w-full">
                {renderMedia(images[selectedIndex], "h-full w-full object-contain bg-black")}
              </div>

              {hasMultipleImages ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border-white/20 bg-black/45 text-white backdrop-blur hover:bg-black/65"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border-white/20 bg-black/45 text-white backdrop-blur hover:bg-black/65"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-300">
              <p>
                {selectedIndex + 1} of {Math.max(images.length, 1)}
              </p>
              <p>{isVideoUrl(images[selectedIndex]) ? "Video" : "Image"}</p>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {viewerItems.map(({ media, index }) => (
                <button
                  key={`${media}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`relative h-[74px] w-[104px] shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                    selectedIndex === index
                      ? "border-[#8BCCE6]"
                      : "border-white/10 hover:border-white/40"
                  }`}
                >
                  {isVideoUrl(media) ? (
                    <>
                      <video
                        src={media}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="h-4 w-4 text-white" />
                      </span>
                    </>
                  ) : (
                    <Image
                      src={media}
                      fill
                      alt={`Photo ${index + 1}`}
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

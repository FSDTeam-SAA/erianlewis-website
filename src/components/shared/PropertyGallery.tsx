"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface PropertyGalleryProps {
    images: string[];
    totalCount: number;
}

export function PropertyGallery({ images, totalCount }: PropertyGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const activeMedia = images[selectedIndex];
    const isVideo = Boolean(activeMedia && /\.(mp4|webm|ogg|mov)$/i.test(activeMedia));

    return (
        <div>
            {/* Main image */}
            <div className="w-full h-[288px] md:h-[400px] rounded-2xl overflow-hidden relative group shadow-sm bg-gray-100">
                {images.length > 0 && activeMedia ? (
                    isVideo ? (
                        <video
                            src={activeMedia}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            controls
                            playsInline
                            preload="metadata"
                        />
                    ) : (
                        <Image src={activeMedia} fill alt="Property Image" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    )
                ) : null}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                {/* Bottom-left badge */}
                {totalCount > 0 ? (
                    <button className="absolute bottom-4 left-4 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors backdrop-blur-md shadow-sm">
                        View All {totalCount} Photos
                    </button>
                ) : null}

                {/* Top-right counter */}
                <div className="absolute top-4 right-4 bg-black/40 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm tracking-wide">
                    {Math.min(selectedIndex + 1, Math.max(totalCount, 1))}/{Math.max(totalCount, 1)}
                </div>
            </div>

            {/* Thumbnail strip below main image */}
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                {images.slice(0, 4).map((img, i) => (
                    <button
                        type="button"
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        className={`w-[72px] h-[52px] rounded-xl overflow-hidden cursor-pointer border-2 transition-colors relative shrink-0 shadow-sm bg-gray-100 ${selectedIndex === i ? "border-blue-400" : "border-transparent hover:border-blue-400"}`}
                    >
                        {/\.(mp4|webm|ogg|mov)$/i.test(img) ? (
                            <>
                                <video src={img} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                                    <Play className="h-4 w-4 text-white" />
                                </span>
                            </>
                        ) : (
                            <Image src={img} fill alt={`Thumbnail ${i + 1}`} className="object-cover" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

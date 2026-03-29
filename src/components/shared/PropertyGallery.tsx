import Image from "next/image";

interface PropertyGalleryProps {
    images: string[];
    totalCount: number;
}

export function PropertyGallery({ images, totalCount }: PropertyGalleryProps) {
    return (
        <div>
            {/* Main image */}
            <div className="w-full h-[288px] md:h-[400px] rounded-2xl overflow-hidden relative group shadow-sm bg-gray-100">
                {images.length > 0 && (
                    <Image src={images[0]} fill alt="Property Image" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                )}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                {/* Bottom-left badge */}
                <button className="absolute bottom-4 left-4 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors backdrop-blur-md shadow-sm">
                    View All {totalCount} Photos
                </button>

                {/* Top-right counter */}
                <div className="absolute top-4 right-4 bg-black/40 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md shadow-sm tracking-wide">
                    1/{totalCount}
                </div>
            </div>

            {/* Thumbnail strip below main image */}
            <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                {images.slice(0, 4).map((img, i) => (
                    <div key={i} className="w-[72px] h-[52px] rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-400 transition-colors relative shrink-0 shadow-sm bg-gray-100">
                        <Image src={img} fill alt={`Thumbnail ${i + 1}`} className="object-cover" />
                    </div>
                ))}
            </div>
        </div>
    );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BedDouble, MapPin, Star, Video, Bath, Ruler } from "lucide-react";
import { formatConvertedPrice } from "@/lib/currency";
import { useCurrencyPreference } from "@/lib/hooks/useCurrencyPreference";

export interface PropertyCardProps {
    id: string;
    image: string;
    title: string;
    location: string;
    parking: string;
    rating: number;
    reviewCount: number;
    amenities: string[];
    price: string;
    currency: string;
    isVideo?: boolean;
    beds?: number;
    baths?: number;
    areaSqft?: number;
    listingType?: "rent" | "buy";
    rawPrice?: number;
    basePrice?: number;
    baseCurrency?: string;
}

export function PropertyCard({
    id, image, title, location, parking, rating, reviewCount, amenities, price, currency, isVideo, beds, baths, areaSqft, listingType, basePrice, baseCurrency
}: PropertyCardProps) {
    const pathname = usePathname();
    const { selectedCurrency, rates } = useCurrencyPreference();
    const isBuy = listingType === "buy" || pathname?.includes("/buy");
    const href = isBuy ? `/buy/${id}` : `/rentals/${id}`;
    const displayPrice = basePrice !== undefined || baseCurrency
        ? formatConvertedPrice(basePrice, baseCurrency, selectedCurrency, rates)
        : `${currency} ${price}`;
    const priceLabel = isBuy ? displayPrice : `Starting from ${displayPrice}/month`;

    return (
        <Link href={href} className="block w-full overflow-hidden rounded-[24px] border border-[#e6e6eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group/card">
            {/* Image with price badge */}
            <div className="group relative h-48 w-full overflow-hidden">
                {isVideo ? (
                    <video
                        src={image}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        muted
                        playsInline
                        preload="metadata"
                    />
                ) : (
                    <Image src={image} fill alt={title} className="object-cover transition-transform duration-500 group-hover/card:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <span
                    style={{ background: 'linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)' }}
                    className="absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-md"
                >
                    {priceLabel}
                </span>
                {isVideo ? (
                    <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                        <Video className="h-3.5 w-3.5" />
                        Video
                    </span>
                ) : null}
            </div>

            {/* Card content */}
            <div className="p-5">
                <h3 className="mb-2 line-clamp-1 text-[16px] font-bold leading-normal text-black">{title}</h3>

                <div className="mb-2.5 flex items-center gap-1.5 text-xs text-[#6b7280]">
                    <MapPin size={14} className="shrink-0 text-[#9ca3af]" />
                    <span className="line-clamp-1">{location}</span>
                </div>

                <p className="mb-3.5 text-xs text-[#6b7280]">
                    Parking: <span className="font-medium text-[#202124]">{parking}</span>
                </p>

                {/* Star rating */}
                <div className="mb-4 flex items-center gap-1.5">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-[13px] font-semibold text-[#202124]">{rating} <span className="font-medium tracking-tight text-[#6b7280]">({reviewCount})</span></span>
                </div>

                {/* Amenity tags */}
                <div className="flex flex-wrap gap-1.5">
                    {amenities.slice(0, 3).map((a) => (
                        <span key={a} className="rounded-full border border-[#e5e7eb] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-medium text-[#5f6368]">
                            {a}
                        </span>
                    ))}
                    {amenities.length > 3 && (
                        <span className="px-1 py-1 text-[11px] font-medium text-[#9aa3b2]">
                            +{amenities.length - 3} more
                        </span>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#f8fafc] p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b7280]">
                        <BedDouble className="h-3.5 w-3.5 text-[#8BCCE6]" />
                        <span>{beds ?? 0} Beds</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b7280]">
                        <Bath className="h-3.5 w-3.5 text-[#8BCCE6]" />
                        <span>{baths ?? 0} Baths</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#6b7280]">
                        <Ruler className="h-3.5 w-3.5 text-[#8BCCE6]" />
                        <span>{areaSqft ?? 0} sqft</span>
                    </div>
                </div>

                <div
                    style={{ background: "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)" }}
                    className="mt-4 flex h-10 items-center justify-center rounded-xl text-[13px] font-semibold text-white"
                >
                    {isBuy ? "View Property" : "Schedule Viewing"}
                </div>
            </div>
        </Link>
    );
}

export function PropertyCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-[24px] border border-[#e6e6eb] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="h-48 w-full animate-pulse bg-[#eef2f6]" />
            <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-[#eef2f6]" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-[#eef2f6]" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-[#eef2f6]" />
                <div className="flex gap-2">
                    <div className="h-7 w-20 animate-pulse rounded-full bg-[#eef2f6]" />
                    <div className="h-7 w-16 animate-pulse rounded-full bg-[#eef2f6]" />
                    <div className="h-7 w-16 animate-pulse rounded-full bg-[#eef2f6]" />
                </div>
                <div className="h-14 w-full animate-pulse rounded-2xl bg-[#eef2f6]" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-[#eef2f6]" />
            </div>
        </div>
    );
}

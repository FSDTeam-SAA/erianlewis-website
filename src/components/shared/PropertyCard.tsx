"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Star } from "lucide-react";

interface PropertyCardProps {
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
}

export function PropertyCard({
    id, image, title, location, parking, rating, reviewCount, amenities, price, currency
}: PropertyCardProps) {
    const pathname = usePathname();
    const isBuy = pathname?.includes("/buy");
    const href = isBuy ? `/buy/${id}` : `/rentals/${id}`;

    return (
        <Link href={href} className="block w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group/card">
            {/* Image with price badge */}
            <div className="relative h-48 w-full group">
                <Image src={image} fill alt={title} className="object-cover group-hover/card:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <span
                    style={{ background: 'linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)' }}
                    className="absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10 tracking-wide"
                >
                    {currency} {price}/mo
                </span>
            </div>

            {/* Card content */}
            <div className="p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-1">{title}</h3>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2.5">
                    <MapPin size={14} className="shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{location}</span>
                </div>

                <p className="text-xs text-gray-500 mb-3.5">
                    Parking: <span className="text-gray-800 font-medium">{parking}</span>
                </p>

                {/* Star rating */}
                <div className="flex items-center gap-1.5 mb-4">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[13px] font-semibold text-gray-800">{rating} <span className="text-gray-500 font-medium tracking-tight">({reviewCount})</span></span>
                </div>

                {/* Amenity tags */}
                <div className="flex flex-wrap gap-1.5">
                    {amenities.slice(0, 3).map((a) => (
                        <span key={a} className="text-[11px] font-medium border border-gray-200 rounded-full px-2.5 py-1 text-gray-600 bg-gray-50/80">
                            {a}
                        </span>
                    ))}
                    {amenities.length > 3 && (
                        <span className="text-[11px] font-medium text-gray-400 px-1 py-1">
                            +{amenities.length - 3} more
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

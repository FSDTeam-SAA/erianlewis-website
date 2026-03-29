"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Share2, Heart, MapPin, ExternalLink } from "lucide-react";

import { Footer } from "@/components/shared/Footer";
import { PropertyGallery } from "@/components/shared/PropertyGallery";
import { PropertySpecGrid } from "@/components/shared/PropertySpecGrid";
import { ContactLandlordForm } from "@/components/shared/ContactLandlordForm";
import { ScheduleViewingModal } from "@/components/shared/ScheduleViewingModal";
import { ReviewSection } from "@/components/shared/ReviewSection";
import { AmenityTag } from "@/components/shared/AmenityTag";

const mockProperty = {
    id: '1',
    images: ['/main-hero-banner.jpg', '/main-hero-banner.jpg', '/main-hero-banner.jpg', '/main-hero-banner.jpg'],
    price: '1,450,000',
    currency: 'USD',
    type: 'buy',
    name: 'Modern Paradise Estate',
    location: 'Santorini, DAMAC Lagoons, USA',
    beds: 4, baths: 4, sqft: 275, parking: 1,
    propertyType: 'House', island: 'Jamaica',
    leaseTerms: 'N/A', // Modified for sale
    utilitiesIncluded: "N/A", furnished: "Yes", petFriendly: "Yes",
    parkingType: 'Covered Parking', parkingSpace: 1,
    currencyType: 'USD', pinConfirmed: "Yes",
    amenities: [
        'Air conditioning', 'Walk in closets', 'Ceiling fans',
        'Tile floors', 'Hardwood floors', 'Patio', 'Fenced yard',
        'Balcony', 'Driveway', 'Dryer', 'Garage', 'Oven or range',
        'Security system'
    ],
    rating: 5.0, reviewCount: 1,
    description: 'Description placeholder'
};

export default function BuyPropertyDetails() {
    const router = useRouter();
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

    const specs = [
        { label: 'Beds', value: mockProperty.beds },
        { label: 'Baths', value: mockProperty.baths },
        { label: 'Sq Ft', value: mockProperty.sqft },
        { label: 'Parking', value: mockProperty.parking },
        { label: 'Type', value: mockProperty.propertyType },
        { label: 'Island', value: mockProperty.island },
    ];

    return (
        <main className="min-h-screen bg-gray-50 font-sans">
            <div className="bg-white max-w-6xl mx-auto px-6 py-4 shadow-sm min-h-screen">

                {/* SECTION 1: TOP NAVBAR */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 mb-6 gap-4">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[14px] font-bold text-gray-600 hover:text-black transition-colors">
                            <ArrowLeft size={18} /> Back
                        </button>
                        <Image src="/logo.png" width={90} height={26} alt="Alora" className="object-contain invert brightness-0" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg px-3.5 py-2 shadow-sm">
                            <Share2 size={16} className="text-gray-500" /> Share
                        </button>
                        <button className="flex items-center justify-center gap-1.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg px-3.5 py-2 shadow-sm">
                            <Heart size={16} className="text-gray-500" /> Save
                        </button>
                    </div>
                </div>

                {/* SECTION 2: GALLERY */}
                <PropertyGallery images={mockProperty.images} totalCount={4} />

                <div className="flex flex-col lg:flex-row gap-10 mt-10">
                    {/* LEFT COLUMN */}
                    <div className="flex-1 pb-16">

                        {/* SECTION 3: PROPERTY HEADER */}
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[28px] font-extrabold text-gray-900 tracking-tight">
                                {mockProperty.currency} {mockProperty.price}
                            </span>
                            <span
                                style={{ background: 'linear-gradient(102.89deg, #80BDEA 0%, #4E8BE3 100%)' }}
                                className="text-white text-[12px] px-3 py-1 rounded-full font-bold shadow-sm tracking-wide"
                            >
                                For Sale
                            </span>
                        </div>
                        <h1 className="text-[22px] font-extrabold text-gray-900 mb-2.5 tracking-tight">{mockProperty.name}</h1>
                        <div className="flex items-center gap-1.5 text-[14px] font-semibold text-gray-500 mb-8">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{mockProperty.location}</span>
                        </div>

                        {/* SECTION 4: PROPERTY SPECS GRID */}
                        <PropertySpecGrid specs={specs} />

                        {/* SECTION 5: RENTAL DETAILS */}
                        <div className="mt-10">
                            <h2 className="text-[16px] font-bold text-gray-900 mb-5">Sale Details</h2>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-5">
                                <div>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Lease Terms</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-1.5">{mockProperty.leaseTerms}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Utilities Included</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-1.5">{mockProperty.utilitiesIncluded}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Furnished</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-1.5">{mockProperty.furnished}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Pet Friendly</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-1.5">{mockProperty.petFriendly}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-gray-100" />

                        {/* SECTION 6: LOCATION MAP */}
                        <div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
                                <h2 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin size={18} className="text-blue-500" /> Location
                                </h2>
                                <div className="flex gap-3">
                                    <button className="flex items-center justify-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100 rounded-lg px-3.5 py-2 shadow-sm">
                                        <ExternalLink size={14} /> Open in Google Maps
                                    </button>
                                    <button className="flex items-center justify-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100 rounded-lg px-3.5 py-2 shadow-sm">
                                        <ExternalLink size={14} /> Open in Apple Maps
                                    </button>
                                </div>
                            </div>
                            <div className="w-full h-56 rounded-2xl overflow-hidden bg-gray-100 relative shadow-inner border border-gray-200/50">
                                <Image src="/main-hero-banner.jpg" fill alt="Map" className="object-cover opacity-60 grayscale" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 shadow-sm border border-white">Map View Placeholder</div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-gray-100" />

                        {/* SECTION 7: DESCRIPTION */}
                        <div>
                            <h2 className="text-[16px] font-bold text-gray-900 mb-3">Description</h2>
                            <p className="text-[14px] font-medium text-gray-500 leading-relaxed">{mockProperty.description}</p>
                        </div>

                        <hr className="my-8 border-gray-100" />

                        {/* SECTION 8: ADDITIONAL DETAILS */}
                        <div>
                            <h2 className="text-[16px] font-bold text-gray-900 mb-5">Additional Details</h2>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-5">
                                <div>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Parking Type</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-1.5">{mockProperty.parkingType}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Parking Space</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-1.5">{mockProperty.parkingSpace}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-gray-100" />

                        {/* SECTION 9: MORE DETAILS */}
                        <div>
                            <h2 className="text-[16px] font-bold text-gray-900 mb-5">More Details</h2>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-5">
                                <div>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Currency Type</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-1.5">{mockProperty.currencyType}</p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Pin Confirmed</p>
                                    <p className="text-[14px] font-bold text-gray-800 mt-1.5">{mockProperty.pinConfirmed}</p>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-gray-100" />

                        {/* SECTION 10: AMENITIES */}
                        <div>
                            <h2 className="text-[16px] font-bold text-gray-900 mb-4">Amenities</h2>
                            <div className="flex flex-wrap gap-2.5">
                                {mockProperty.amenities.map(a => (
                                    <AmenityTag key={a} label={a} />
                                ))}
                            </div>
                        </div>

                        <hr className="my-8 border-gray-100" />

                        {/* SECTION 11: REVIEWS */}
                        <ReviewSection />

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="w-full lg:w-[360px] shrink-0 border-l border-gray-100 lg:pl-10">
                        <ContactLandlordForm onScheduleClick={() => setScheduleModalOpen(true)} />
                    </div>
                </div>
            </div>

            <Footer />

            <ScheduleViewingModal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} />
        </main>
    )
}

"use client";

import { useState } from "react";
import { ListingNavbar } from "@/components/shared/ListingNavbar";
import { Footer } from "@/components/shared/Footer";
import { PropertyCard } from "@/components/shared/PropertyCard";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { MapPin, SlidersHorizontal, Search, BookmarkPlus, Flag, Map } from "lucide-react";

// Mock data as requested
const mockProperties = [
    {
        id: '1',
        image: '/main-hero-banner.jpg',
        title: 'Property for rent in Dubai',
        location: 'PEGWELL LAND & PEGWELL PARK, Barbados',
        parking: 'Covered Parking',
        rating: 5.0,
        reviewCount: 1,
        amenities: ['Air conditioning', 'Heating', 'Fireplace'],
        price: '12,345',
        currency: 'JMD'
    },
    {
        id: '2',
        image: '/main-hero-banner.jpg',
        title: 'Property for rent in Dubai',
        location: 'PEGWELL LAND & PEGWELL PARK, Barbados',
        parking: 'Covered Parking',
        rating: 5.0,
        reviewCount: 1,
        amenities: ['Air conditioning', 'Heating', 'Fireplace'],
        price: '12,345',
        currency: 'JMD'
    },
    {
        id: '3',
        image: '/main-hero-banner.jpg',
        title: 'Property for rent in Dubai',
        location: 'PEGWELL LAND & PEGWELL PARK, Barbados',
        parking: 'Covered Parking',
        rating: 5.0,
        reviewCount: 1,
        amenities: ['Air conditioning', 'Heating', 'Fireplace'],
        price: '12,345',
        currency: 'JMD'
    },
    {
        id: '4',
        image: '/main-hero-banner.jpg',
        title: 'Property for rent in Dubai',
        location: 'PEGWELL LAND & PEGWELL PARK, Barbados',
        parking: 'Covered Parking',
        rating: 5.0,
        reviewCount: 1,
        amenities: ['Air conditioning', 'Heating', 'Fireplace'],
        price: '12,345',
        currency: 'JMD'
    }
];

export default function RentalsPage() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <main className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <ListingNavbar />

            {/* Search Bar Section */}
            <div className="bg-white border-b border-gray-100 py-4 px-6 w-full shadow-sm relative z-30">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-6xl mx-auto w-full">
                    {/* Search input */}
                    <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-[13px] bg-white w-full transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                        <MapPin size={18} className="text-gray-400 shrink-0" />
                        <input
                            placeholder="Location, City or Island..."
                            className="flex-1 outline-none text-[15px] text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal bg-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Filters button */}
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-5 py-[13px] text-[15px] text-gray-700 font-semibold bg-white hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <SlidersHorizontal size={16} className="text-gray-500" />
                            Filters
                        </button>

                        {/* Search button */}
                        <button
                            style={{ background: 'linear-gradient(102.89deg, #80BDEA 0%, #4E8BE3 100%)' }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 text-white px-8 py-[13px] rounded-xl text-[15px] font-bold shadow-md transition-opacity hover:opacity-90 tracking-wide"
                        >
                            <Search size={16} />
                            <span className="hidden md:inline-block">Search</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">

                {/* Results Toolbar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 mb-8">
                    <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight shrink-0">4 Rentals Available</h2>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
                            <BookmarkPlus size={16} className="text-gray-500" />
                            Saved this Search
                        </button>
                        <button className="flex items-center gap-1 border border-gray-200 rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
                            <Flag size={14} className="text-gray-500" />
                            USD($) <span className="text-[10px] ml-0.5 mt-0.5 text-gray-500">▼</span>
                        </button>
                        <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
                            <Map size={16} className="text-gray-500" />
                            Map View
                        </button>
                        <SortDropdown />
                    </div>
                </div>

                {/* Property Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
                    {mockProperties.map((p) => (
                        <PropertyCard key={p.id} {...p} />
                    ))}
                </div>
            </div>

            <Footer />

            {/* Filter Drawer */}
            <FilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
        </main>
    );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

export function HeroSection() {
    const [activeTab, setActiveTab] = useState<"Rent" | "Buy">("Rent");
    const [searchInput, setSearchInput] = useState("");
    const router = useRouter();

    const handleSearch = () => {
        const baseRoute = activeTab === "Buy" ? "/buy" : "/rentals";
        const query = searchInput.trim();

        if (!query) {
            router.push(baseRoute);
            return;
        }

        router.push(`${baseRoute}?search=${encodeURIComponent(query)}`);
    };

    return (
        <section className="relative min-h-[600px] md:min-h-[700px] w-full flex flex-col bg-slate-50 border-none overflow-hidden">
            <div className="absolute inset-0 z-0 border-none">
                <Image
                    src="/main-hero-banner.jpg"
                    alt="Alora hero background"
                    fill
                    priority
                    className="object-cover border-none"
                />
                {/* Removed black overlay as requested to match the bright figma style */}
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 w-full h-full border-none">
                <div className="w-full max-w-4xl -mt-20 md:-mt-16 border-none">
                    <h1 className="text-[36px] md:text-[48px] font-[700] text-[#2C3E50] mb-6 leading-[1.2] text-center font-sans tracking-tight">
                        Discover Your <br className="md:hidden" /> Caribbean Paradise
                    </h1>
                    <p className="text-[16px] md:text-[20px] text-[#000000] font-[600] mb-12 max-w-2xl mx-auto leading-[1.2] text-center font-sans">
                        Luxury homes and rentals across the most beautiful islands in the Caribbean
                    </p>

                    {/* Search Box Container */}
                    <div className="bg-white rounded-2xl p-2 max-w-2xl mx-auto flex flex-col shadow-2xl border-none mt-2">
                        {/* Tabs */}
                        <div className="flex w-full mb-2">
                            <button
                                onClick={() => setActiveTab("Rent")}
                                className={`flex-1 py-3.5 font-semibold transition-all text-sm md:text-base ${activeTab === "Rent" ? "text-white rounded-xl shadow-md cursor-default" : "bg-transparent text-gray-600 hover:text-gray-900"}`}
                                style={{ background: activeTab === "Rent" ? 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' : undefined }}
                            >
                                Rent
                            </button>
                            <button
                                onClick={() => setActiveTab("Buy")}
                                className={`flex-1 py-3.5 font-semibold transition-all text-sm md:text-base ${activeTab === "Buy" ? "text-white rounded-xl shadow-md cursor-default" : "bg-transparent text-gray-600 hover:text-gray-900"}`}
                                style={{ background: activeTab === "Buy" ? 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' : undefined }}
                            >
                                Buy
                            </button>
                        </div>

                        {/* Input & Action */}
                        <div className="flex items-center gap-2 px-2 pb-2 pt-2 mt-1 border border-gray-200 rounded-xl">
                            <MapPin className="text-gray-400 w-6 h-6 shrink-0 ml-1" />
                            <input
                                type="text"
                                placeholder="Location, City & Island"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 font-medium py-2 text-sm md:text-base tracking-normal"
                            />
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="flex items-center justify-center gap-2 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-transform hover:-translate-y-0.5 shadow-md shrink-0 border-none"
                                style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                            >
                                <Search className="w-5 h-5" />
                                <span className="hidden md:inline-block tracking-normal">Search</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

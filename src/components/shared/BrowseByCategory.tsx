"use client";

import { useState } from "react";
import { CategoryCard } from "./CategoryCard";
import { StatCard } from "./StatCard";
import { Building, Home, Hotel, House, Castle, Map, Store, Sparkles, BarChart2, Users, Building2 } from "lucide-react";

const CATEGORIES = [
    { label: "Apartment", icon: Building },
    { label: "Home", icon: Home },
    { label: "Condo", icon: Hotel },
    { label: "Townhouse", icon: House },
    { label: "Villa", icon: Castle },
    { label: "Land", icon: Map },
    { label: "Commercial", icon: Store },
    { label: "New Listing", icon: Sparkles },
];

export function BrowseByCategory() {
    const [activeTab, setActiveTab] = useState<"Rent" | "Buy">("Rent");

    return (
        <section
            className="w-full relative z-20 pt-1 pb-24 min-h-[500px] bg-white"
        >
            {/* Overlapping Stat Cards mapped according to exact specs */}
            <div className="w-full -mt-16 md:-mt-24 mb-16 relative z-30 px-4">
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg pt-[24px] px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <StatCard
                            title="Total Site Visits"
                            value="4,015"
                            subtitle="All-time"
                            icon={BarChart2}
                            gradient="linear-gradient(102.89deg, #80BDEA 0%, #4E8BE3 100%)"
                        />
                        <StatCard
                            title="Registered User"
                            value="26"
                            subtitle="Tenants + Landlords + Agents"
                            icon={Users}
                            gradient="linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)"
                        />
                        <StatCard
                            title="Total Site Visits"
                            value="4,015"
                            subtitle="All-time"
                            icon={Building2}
                            gradient="linear-gradient(102.89deg, #2B3D4F 0%, #203041 100%)"
                        />
                    </div>
                </div>
            </div>

            <div className="px-6 max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-gray-900 tracking-tight drop-shadow-sm">
                    Browse By Category
                </h2>

                <div className="flex justify-center mb-16">
                    <div className="flex bg-white/70 backdrop-blur-md shadow-sm border border-white/40 p-1.5 rounded-2xl max-w-xs w-full">
                        <button
                            onClick={() => setActiveTab("Rent")}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm ${activeTab === "Rent" ? "text-white cursor-default" : "text-gray-600 hover:text-gray-900 hover:bg-white/50 bg-transparent"}`}
                            style={{ background: activeTab === "Rent" ? "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)" : "transparent" }}
                        >
                            Rent
                        </button>
                        <button
                            onClick={() => setActiveTab("Buy")}
                            className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm shadow-sm ${activeTab === "Buy" ? "text-white cursor-default" : "text-gray-600 hover:text-gray-900 hover:bg-white/50 bg-transparent"}`}
                            style={{ background: activeTab === "Buy" ? "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)" : "transparent" }}
                        >
                            Buy
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8 justify-center">
                    {CATEGORIES.map((cat, idx) => (
                        <CategoryCard key={idx} label={cat.label} icon={cat.icon} />
                    ))}
                </div>
            </div>
        </section>
    );
}

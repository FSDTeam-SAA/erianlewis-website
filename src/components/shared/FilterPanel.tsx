"use client";

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px] transition-opacity"
                onClick={onClose}
            />
            <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-gray-100">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 bg-white">
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                    <button className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors">Clear all</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 custom-scrollbar">
                    {/* Property Type */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Type</h3>
                        <div className="flex flex-wrap gap-2">
                            {["Apartment", "House", "Condo", "Townhouse", "Villa"].map((type, i) => (
                                <button
                                    key={type}
                                    className={`px-4 py-1.5 text-[13px] rounded-full border transition-colors ${i === 0 ? 'bg-blue-50 border-blue-400 text-blue-600 font-semibold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 font-medium'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                        <div className="flex items-center gap-3">
                            <input type="text" placeholder="Min Price" className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400 text-gray-800 font-medium transition-all" />
                            <input type="text" placeholder="Max Price" className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400 text-gray-800 font-medium transition-all" />
                        </div>
                    </div>

                    {/* Rooms */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Bedrooms</h3>
                        <div className="flex items-center gap-2 mb-6">
                            {["1", "2", "3", "4", "5+"].map((num, i) => (
                                <button
                                    key={num}
                                    className={`w-10 h-10 rounded-lg border text-sm flex items-center justify-center transition-colors ${i === 0 ? 'bg-blue-50 border-blue-400 text-blue-600 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 font-medium'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Bathrooms</h3>
                        <div className="flex items-center gap-2">
                            {["1", "2", "3", "4", "5+"].map((num, i) => (
                                <button
                                    key={num}
                                    className={`w-10 h-10 rounded-lg border text-sm flex items-center justify-center transition-colors ${i === 0 ? 'bg-blue-50 border-blue-400 text-blue-600 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 font-medium'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pet Friendly */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-[18px] h-[18px] rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer" />
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-black transition-colors">Pet Friendly</span>
                    </label>

                    {/* Amenities */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-2">
                            {[
                                "Air conditioning", "Walk in closets", "Ceiling fans", "Patio",
                                "Hardwood floors", "Fenced yard", "Tile floors", "Driveway",
                                "Balcony", "Dryer", "Yard", "Dishwasher", "Garage", "In unit laundry",
                                "Washer", "Refrigerator", "Oven or range",
                                "Heating", "Microwave", "Fireplace", "Security system", "Carpet"
                            ].map((amenity, i) => (
                                <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                                    <input type="checkbox" className="w-[16px] h-[16px] rounded border-gray-300 text-blue-500 focus:ring-blue-500 mt-[1px] cursor-pointer" />
                                    <span className="text-xs font-medium text-gray-600 leading-tight group-hover:text-gray-900 transition-colors mt-0.5">{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 shrink-0 mt-auto shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 tracking-wide"
                        style={{ background: 'linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)' }}
                        onClick={onClose}
                    >
                        Search
                    </button>
                </div>
            </div>
        </>
    );
}

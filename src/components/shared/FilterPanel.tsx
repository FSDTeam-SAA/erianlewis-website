"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

export interface ListingFiltersState {
    type: string;
    island: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
    petFriendly: boolean;
    amenities: string[];
}

interface FilterOption {
    _id: string;
    name: string;
}

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    filters: ListingFiltersState;
    categories: FilterOption[];
    islands: FilterOption[];
    amenities: string[];
    loading?: boolean;
    error?: string | null;
    onApply: (filters: ListingFiltersState) => void;
    onClear: () => void;
}

const BED_BATH_OPTIONS = ["1", "2", "3", "4", "5+"];

export function FilterPanel({
    isOpen,
    onClose,
    title = "Filters",
    filters,
    categories,
    islands,
    amenities,
    loading = false,
    error = null,
    onApply,
    onClear,
}: FilterPanelProps) {
    const [draft, setDraft] = useState<ListingFiltersState>(filters);

    useEffect(() => {
        setDraft(filters);
    }, [filters]);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px] transition-opacity"
                onClick={onClose}
            />
            <div className="fixed right-0 top-0 z-50 flex h-full w-[360px] max-w-full flex-col overflow-hidden border-l border-gray-100 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 bg-white">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                onClear();
                                onClose();
                            }}
                            className="text-sm font-medium text-[#8BCCE6] transition-colors hover:text-[#4E8BE3]"
                        >
                            Clear all
                        </button>
                        <button type="button" onClick={onClose} className="text-gray-500 transition-colors hover:text-black">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center gap-3 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-4 text-sm font-medium text-[#5f6368]">
                            <Loader2 className="h-4 w-4 animate-spin text-[#8BCCE6]" />
                            Loading filter options...
                        </div>
                    ) : null}

                    {error ? (
                        <div className="rounded-2xl border border-[#f3c7ba] bg-[#fff7f2] px-4 py-4">
                            <p className="text-sm font-semibold text-[#202124]">Couldn&apos;t load some filters</p>
                            <p className="mt-1 text-xs text-[#6b7280]">{error}</p>
                        </div>
                    ) : null}

                    {/* Island */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-gray-900">Island</h3>
                        <select
                            value={draft.island}
                            onChange={(event) => setDraft((prev) => ({ ...prev, island: event.target.value }))}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-800 outline-none transition-all focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                        >
                            <option value="">All islands</option>
                            {islands.map((island) => (
                                <option key={island._id} value={island._id}>
                                    {island.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Property Type */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Type</h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((type) => (
                                <button
                                    key={type._id}
                                    type="button"
                                    onClick={() =>
                                        setDraft((prev) => ({
                                            ...prev,
                                            type: prev.type === type._id ? "" : type._id,
                                        }))
                                    }
                                    className={`px-4 py-1.5 text-[13px] rounded-full border transition-colors ${draft.type === type._id ? 'bg-blue-50 border-blue-400 text-blue-600 font-semibold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 font-medium'
                                        }`}
                                >
                                    {type.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={draft.minPrice}
                                onChange={(event) => setDraft((prev) => ({ ...prev, minPrice: event.target.value.replace(/[^0-9]/g, "") }))}
                                placeholder="Min Price"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400 text-gray-800 font-medium transition-all"
                            />
                            <input
                                type="text"
                                value={draft.maxPrice}
                                onChange={(event) => setDraft((prev) => ({ ...prev, maxPrice: event.target.value.replace(/[^0-9]/g, "") }))}
                                placeholder="Max Price"
                                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400 text-gray-800 font-medium transition-all"
                            />
                        </div>
                    </div>

                    {/* Rooms */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Bedrooms</h3>
                        <div className="flex items-center gap-2 mb-6">
                            {BED_BATH_OPTIONS.map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setDraft((prev) => ({ ...prev, bedrooms: prev.bedrooms === num.replace("+", "5") ? "" : num.replace("+", "5") }))}
                                    className={`w-10 h-10 rounded-lg border text-sm flex items-center justify-center transition-colors ${draft.bedrooms === num.replace("+", "5") ? 'bg-blue-50 border-blue-400 text-blue-600 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 font-medium'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Bathrooms</h3>
                        <div className="flex items-center gap-2">
                            {BED_BATH_OPTIONS.map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setDraft((prev) => ({ ...prev, bathrooms: prev.bathrooms === num.replace("+", "5") ? "" : num.replace("+", "5") }))}
                                    className={`w-10 h-10 rounded-lg border text-sm flex items-center justify-center transition-colors ${draft.bathrooms === num.replace("+", "5") ? 'bg-blue-50 border-blue-400 text-blue-600 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 font-medium'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pet Friendly */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={draft.petFriendly}
                            onChange={(event) => setDraft((prev) => ({ ...prev, petFriendly: event.target.checked }))}
                            className="w-[18px] h-[18px] rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-black transition-colors">Pet Friendly</span>
                    </label>

                    {/* Amenities */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-2">
                            {amenities.map((amenity, i) => (
                                <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={draft.amenities.includes(amenity)}
                                        onChange={(event) =>
                                            setDraft((prev) => ({
                                                ...prev,
                                                amenities: event.target.checked
                                                    ? [...prev.amenities, amenity]
                                                    : prev.amenities.filter((item) => item !== amenity),
                                            }))
                                        }
                                        className="w-[16px] h-[16px] rounded border-gray-300 text-blue-500 focus:ring-blue-500 mt-[1px] cursor-pointer"
                                    />
                                    <span className="text-xs font-medium text-gray-600 leading-tight group-hover:text-gray-900 transition-colors mt-0.5">{amenity}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 shrink-0 mt-auto shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)]">
                    <button
                        type="button"
                        className="w-full py-3.5 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 tracking-wide"
                        style={{ background: 'linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)' }}
                        onClick={() => onApply(draft)}
                    >
                        Search
                    </button>
                </div>
            </div>
        </>
    );
}

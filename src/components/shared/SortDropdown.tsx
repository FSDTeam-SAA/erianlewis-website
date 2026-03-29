"use client";

import { useState, useRef, useEffect } from "react";

export function SortDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("Newest Listings");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const options = [
        "Newest Listings",
        "Price low to high",
        "Price high to low",
        "Bedrooms most to fewest"
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white hover:bg-gray-50 shadow-sm transition-colors"
            >
                <span className="font-medium text-gray-800">{selected}</span>
                <span className="text-[9px] text-gray-500 ml-1">▼</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 min-w-[200px] bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-150">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => {
                                setSelected(option);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center transition-colors ${selected === option ? "font-bold text-gray-900" : "text-gray-600 font-medium"
                                }`}
                        >
                            {selected === option && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2.5" />}
                            <span className={selected === option ? "" : "ml-4"}>{option}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

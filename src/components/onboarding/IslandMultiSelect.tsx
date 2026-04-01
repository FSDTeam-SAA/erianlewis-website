"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";

interface IslandOption {
    _id: string;
    name: string;
}

interface IslandMultiSelectProps {
    options: IslandOption[];
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    helperText?: string;
    error?: string;
}

export function IslandMultiSelect({
    options,
    value,
    onChange,
    placeholder = "Select island",
    disabled = false,
    helperText,
    error,
}: IslandMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOptions = useMemo(
        () => options.filter((option) => value.includes(option._id)),
        [options, value]
    );

    const toggleValue = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((item) => item !== id));
            return;
        }
        onChange([...value, id]);
    };

    const clearValue = () => onChange([]);

    return (
        <div className="space-y-2" ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen((prev) => !prev)}
                className={`flex h-12 w-full items-center justify-between rounded-lg border px-4 text-left text-sm transition-colors ${disabled
                    ? "cursor-not-allowed border-[#e1e6ef] bg-[#f7f9fc] text-[#9aa3b2]"
                    : "border-[#d7dde7] bg-white text-[#202124] hover:border-[#b8c5d8]"
                    } ${error ? "border-[#f6855c]" : ""}`}
            >
                <span className={`truncate ${selectedOptions.length ? "text-[#202124]" : "text-[#9aa3b2]"}`}>
                    {selectedOptions.length
                        ? selectedOptions.map((option) => option.name).join(", ")
                        : placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#5f6368] transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && !disabled && (
                <div className="max-h-56 overflow-y-auto rounded-[14px] border border-[#d7dde7] bg-white p-2 shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
                    {options.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-[#7b8595]">No islands available right now.</div>
                    ) : (
                        options.map((option) => {
                            const selected = value.includes(option._id);
                            return (
                                <button
                                    key={option._id}
                                    type="button"
                                    onClick={() => toggleValue(option._id)}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${selected
                                        ? "bg-[#eef7fb] text-[#202124]"
                                        : "text-[#4b5563] hover:bg-[#f7f9fc]"
                                        }`}
                                >
                                    <span>{option.name}</span>
                                    {selected && <Check className="h-4 w-4 text-[#6bb6d4]" />}
                                </button>
                            );
                        })
                    )}
                </div>
            )}

            {selectedOptions.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[10px] text-[#8a93a3]">
                        Selected: {selectedOptions.map((option) => option.name).join(", ")}
                    </div>
                    <button
                        type="button"
                        onClick={clearValue}
                        className="inline-flex items-center gap-1 text-[11px] text-[#7b8595] underline underline-offset-2 hover:text-[#202124]"
                    >
                        <X className="h-3 w-3" />
                        Clean selection
                    </button>
                </div>
            )}

            {helperText && <p className="text-[10px] text-[#8a93a3]">{helperText}</p>}
            {error && <p className="text-[11px] font-medium text-[#f6855c]">{error}</p>}
        </div>
    );
}

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Island {
    _id: string;
    name: string;
}

interface StepProps {
    stepConfig: OnboardingStep;
}

export function EntityTypeStep({ stepConfig }: StepProps) {
    const { formData, setFormData, goNext, goBack } = useOnboardingStore();
    const { title, subtitle, entityOptions } = stepConfig.content;
    const isIndividual = formData.entityType === "individual";

    const [selectedLocations, setSelectedLocations] = useState<string[]>(formData.operatingLocations || []);
    const [properties, setProperties] = useState<number>(formData.numberOfProperties || 1);

    const { data: islands = [] } = useQuery({
        queryKey: ["public-islands"],
        queryFn: async () => {
            const res = await api.get("/islands", { params: { limit: 100 } });
            return (res.data?.data?.islands || []) as Island[];
        },
    });

    const sortedIslands = useMemo(
        () => [...islands].sort((a, b) => a.name.localeCompare(b.name)),
        [islands]
    );

    const handleSelect = (entityKey: string) => {
        setFormData({
            entityType: entityKey as "individual" | "business",
            operatingLocations: entityKey === "business" ? [] : formData.operatingLocations,
            numberOfProperties: entityKey === "business" ? undefined : formData.numberOfProperties,
        });
    };

    const toggleLocation = (locationId: string) => {
        setSelectedLocations((current) =>
            current.includes(locationId)
                ? current.filter((id) => id !== locationId)
                : [...current, locationId]
        );
    };

    const handleContinue = () => {
        if (!formData.entityType) {
            toast.error("Please choose an entity type");
            return;
        }

        if (formData.entityType === "individual") {
            if (selectedLocations.length === 0) {
                toast.error("Please select at least one operating location");
                return;
            }

            if (properties < 1) {
                toast.error("Please enter the number of properties");
                return;
            }

            setFormData({
                operatingLocations: selectedLocations,
                numberOfProperties: properties,
            });
        }

        goNext();
    };

    return (
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            <div className="mb-6 pl-1">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {entityOptions?.map((option) => {
                    const isBusiness = option.key === 'business';
                    const isSelected = formData.entityType === option.key;

                    return (
                        <div
                            key={option.key}
                            onClick={() => handleSelect(option.key)}
                            className={`p-6 border rounded-2xl cursor-pointer transition-all duration-200 relative
                ${isSelected && isBusiness
                                    ? 'border-[#BFE3EC] bg-[#F5FBFC]'
                                    : isSelected && !isBusiness
                                        ? 'border-[#C1E2ED] bg-[#F7FBFD]'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                }
              `}
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-[18px] h-[18px] rounded-full border-[3px] flex items-center justify-center shrink-0
                                        ${isSelected && isBusiness ? 'border-[#8BCCE6]' : isSelected && !isBusiness ? 'border-[#8BCCE6]' : 'border-gray-300'}
                                    `}>
                                        {isSelected && <div className="w-2 h-2 bg-[#8BCCE6] rounded-full" />}
                                    </div>
                                    <h3 className={`font-bold text-lg text-gray-900`}>
                                        {option.label}
                                    </h3>
                                </div>

                                <p className="text-[13px] text-gray-500 mb-4 font-medium min-h-[40px] pl-7">
                                    {option.description}
                                </p>

                                <div className="space-y-2 pl-7 mb-4">
                                    {option.features?.map((feature, idx) => (
                                        <div key={idx} className="flex items-start text-xs text-gray-500 font-medium">
                                            <span className="mr-2 text-gray-400 font-bold">•</span>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {isSelected && !isBusiness && (
                                    <div className="mt-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-700">Operating Location(s)<span className="text-[#E8825A]">*</span></label>
                                            <p className="text-[10px] text-gray-400 font-medium mb-1">Select the islands you operate in.</p>
                                            <div className="flex flex-wrap gap-2">
                                                {sortedIslands.map((island) => {
                                                    const active = selectedLocations.includes(island._id);
                                                    return (
                                                        <button
                                                            key={island._id}
                                                            type="button"
                                                            onClick={() => toggleLocation(island._id)}
                                                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${active
                                                                ? "border-[#8BCCE6] bg-[#F5FBFC] text-gray-900"
                                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                                                }`}
                                                        >
                                                            {island.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-2">
                                            <label className="text-xs font-bold text-gray-700">Number of properties<span className="text-[#E8825A]">*</span></label>
                                            <input
                                                type="number"
                                                value={properties}
                                                onChange={(e) => setProperties(parseInt(e.target.value) || 0)}
                                                className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-[#8BCCE6] text-gray-700"
                                            />
                                            <p className="text-[10px] text-gray-400 font-medium mt-1 leading-snug">
                                                We use this to recommend the right subscription.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-6 mt-2">
                <button
                    onClick={goBack}
                    className="h-10 px-6 rounded-full border border-gray-200 bg-white font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Back
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!formData.entityType || (isIndividual && selectedLocations.length === 0)}
                    className="h-10 px-8 rounded-full text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ServerCrash } from "lucide-react";

interface Plan {
    _id: string;
    title: string;
    name: string;
    price: number;
    billingCycle: string;
    targetRoles: string[];
    maxProperties: number | null;
    displayFeatures: string[];
    status: string;
}

interface StepProps {
    stepConfig: OnboardingStep;
}

export function PlanSelectionStep({ stepConfig }: StepProps) {
    const { formData, setFormData, goNext, goBack } = useOnboardingStore();
    const { title, subtitle } = stepConfig.content;

    const { data, isLoading, isError } = useQuery({
        queryKey: ["plans", formData.role],
        queryFn: async () => {
            const res = await api.get("/plans", {
                params: {
                    status: "active",
                    role: formData.role
                }
            });
            return (res.data?.data?.items || []) as Plan[];
        },
    });

    const handleSelect = (planId: string) => {
        setFormData({ planId });
    };

    return (
        <div className="bg-transparent w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 text-sm max-w-md mx-auto">{subtitle}</p>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E8825A]" />
                    <p className="text-gray-500 mt-4 text-sm tracking-wide">Fetching available plans...</p>
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-red-100 shadow-sm text-center">
                    <ServerCrash className="w-10 h-10 text-red-300 mb-4" />
                    <p className="text-gray-900 font-medium">Failed to load plans</p>
                    <p className="text-red-500 text-sm mt-1">Please try again later or contact support.</p>
                </div>
            )}

            {!isLoading && !isError && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
                    {data?.map((plan, index) => {
                        const isSelected = formData.planId === plan._id;
                        const isRecommended = index === 1; // Arbitrary logic for UI styling

                        return (
                            <div
                                key={plan._id}
                                onClick={() => handleSelect(plan._id)}
                                className={`relative flex flex-col bg-white rounded-2xl shadow-sm p-6 cursor-pointer transition-all duration-300 border-2
                  ${isSelected ? 'border-[#E8825A] ring-4 ring-[#E8825A]/10 -translate-y-1' : 'border-transparent hover:border-gray-200'}
                `}
                            >
                                {/* Recommended Badge */}
                                {isRecommended && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2C3E50] text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                                        Recommended
                                    </div>
                                )}

                                {/* Check Selector */}
                                {isSelected && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#E8825A] text-white rounded-full flex items-center justify-center shadow-md">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-3xl font-extrabold text-[#E8825A]">
                                            ${plan.price}
                                        </span>
                                        <span className="text-sm text-gray-400 ml-1">/{plan.billingCycle.toLowerCase()}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 mt-4 h-10 border-b border-gray-100 pb-4">
                                        {plan.maxProperties === null ? "Unlimited properties" : `Up to ${plan.maxProperties} properties`}
                                    </p>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.displayFeatures.map((feat, i) => (
                                        <li key={i} className="flex items-start">
                                            <Check size={16} className="text-[#E8825A] shrink-0 mr-3 mt-0.5" />
                                            <span className="text-sm text-gray-600 leading-tight">{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${isSelected ? 'bg-[#E8825A] text-white' : 'bg-gray-50 text-gray-900 border border-gray-200 group-hover:bg-gray-100'
                                        }`}
                                >
                                    {isSelected ? 'Selected' : 'Select Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Control Footer */}
            <div className="pt-2 flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={goBack}
                    className="rounded-full px-6 bg-white border-transparent shadow-sm text-gray-700 hover:bg-gray-50"
                >
                    Back
                </Button>
                <Button
                    onClick={goNext}
                    disabled={!formData.planId && data && data.length > 0}
                    className="bg-[#E8825A] text-white hover:bg-[#d6714a] rounded-full px-8 shadow-sm disabled:opacity-50"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}

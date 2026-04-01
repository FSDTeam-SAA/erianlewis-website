"use client";

import { OnboardingStep } from "@/lib/stores/onboardingStore";
import { Check } from "lucide-react";

interface StepProgressProps {
    activeSteps: OnboardingStep[];
    currentIndex: number;
}

export function StepProgress({ activeSteps, currentIndex }: StepProgressProps) {
    if (!activeSteps || activeSteps.length === 0) return null;

    return (
        <div className="w-full flex items-center justify-center mb-6">
            <div className="flex items-center gap-0 w-full max-w-[400px] justify-between relative px-4">
                {/* Horizontal Background Line */}
                <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[3px] bg-white/40 z-0 rounded-full"></div>

                {activeSteps.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.key} className="relative z-10 flex items-center justify-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full text-[15px] font-bold transition-all duration-300 shadow-sm
                                    ${isCompleted || isCurrent
                                        ? 'bg-white text-gray-800'
                                        : 'bg-white/40 text-white backdrop-blur-sm'}
                                `}
                            >
                                {isCompleted ? <Check size={18} strokeWidth={3} className="text-[#E8825A]" /> : (index + 1)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

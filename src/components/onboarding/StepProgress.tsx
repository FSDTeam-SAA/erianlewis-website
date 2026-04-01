"use client";

import { OnboardingStep } from "@/lib/stores/onboardingStore";
import { Check } from "lucide-react";

interface StepProgressProps {
    activeSteps: OnboardingStep[];
    currentIndex: number;
    currentStepKey?: string;
    role?: "USER" | "LANDLORD" | "AGENT";
}

export function StepProgress({ activeSteps, currentIndex, currentStepKey, role }: StepProgressProps) {
    if (!activeSteps || activeSteps.length === 0) return null;

    const shouldCondense = ["LANDLORD", "AGENT"].includes(role || "") &&
        ["entity_type", "business_profile", "plan_selection", "completion"].includes(currentStepKey || "");

    const milestones = shouldCondense
        ? [
            { key: "profile", label: "Profile" },
            { key: "details", label: "Business profile" },
            { key: "subscription", label: "Subscription" },
        ]
        : activeSteps.map((step) => ({ key: step.key, label: step.name }));

    const condensedCurrentIndex = (() => {
        if (!shouldCondense) return currentIndex;
        if (currentStepKey === "entity_type" || currentStepKey === "business_profile") return 1;
        return 2;
    })();

    const progressIndex = shouldCondense ? condensedCurrentIndex : currentIndex;
    const progressWidth = milestones.length > 1
        ? `${(progressIndex / (milestones.length - 1)) * 100}%`
        : "0%";

    return (
        <div className="mb-8 flex w-full items-center justify-center">
            <div className="relative flex w-full max-w-[630px] items-center justify-between px-7">
                <div className="absolute left-8 right-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/55" />
                <div
                    className="absolute left-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white transition-all duration-300"
                    style={{ width: `calc((100% - 4rem) * ${parseFloat(progressWidth) / 100})` }}
                />

                {milestones.map((step, index) => {
                    const isCompleted = index < progressIndex;
                    const isCurrent = index === progressIndex;

                    return (
                        <div key={step.key} className="relative z-10 flex items-center justify-center">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full text-[15px] font-semibold transition-all duration-300 shadow-sm ${isCompleted || isCurrent
                                    ? "bg-white text-[#202124]"
                                    : "bg-white/30 text-white backdrop-blur-sm"
                                    }`}
                            >
                                {isCompleted ? <Check size={20} strokeWidth={2.5} className="text-[#202124]" /> : (index + 1)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

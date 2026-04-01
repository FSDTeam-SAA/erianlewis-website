"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { OnboardingStep } from "@/lib/stores/onboardingStore";

interface OnboardingResponse {
    status: boolean;
    data: {
        steps: OnboardingStep[];
    };
}

export default function OnboardingPage() {
    const { data, isLoading, isError } = useQuery<OnboardingResponse>({
        queryKey: ["onboarding-config"],
        queryFn: async () => {
            const res = await api.get("/onboarding");
            return res.data;
        },
        retry: 1,
    });

    if (isLoading) {
        return (
            <div className="flex-1 w-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-white" />
                <span className="ml-3 text-white font-medium tracking-wide">Loading setup...</span>
            </div>
        );
    }

    if (isError || !data?.data?.steps) {
        toast.error("Failed to load setup configuration");
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f0d5c8] via-[#d9e8f0] to-[#c8dff0] flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                    <p className="text-red-500 font-medium">Unable to load onboarding.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-6 py-2 bg-[#E8825A] text-white rounded-full"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Filter out disabled steps entirely to keep activeSteps clean payload based on server toggle
    const enabledSteps = data.data.steps.filter(step => step.enabled);

    return (
        <div className="flex-1 w-full flex items-center justify-center p-4">
            <div className="w-full max-w-[550px]">
                <OnboardingWizard allSteps={enabledSteps} />
            </div>
        </div>
    );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { OnboardingWizard } from "./OnboardingWizard";
import { OnboardingStep } from "@/lib/stores/onboardingStore";

interface OnboardingResponse {
    status: boolean;
    data: {
        steps: OnboardingStep[];
    };
}

export function OnboardingScreen() {
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
            <div className="flex min-h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
                <span className="ml-3 text-base font-medium text-white">Loading setup...</span>
            </div>
        );
    }

    if (isError || !data?.data?.steps) {
        toast.error("Failed to load setup configuration");
        return (
            <div className="auth-card max-w-[560px] p-8 text-center">
                <p className="text-base font-medium text-[#f6855c]">Unable to load onboarding.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="auth-button-primary mt-6 px-6"
                >
                    Retry
                </button>
            </div>
        );
    }

    const enabledSteps = data.data.steps.filter((step) => step.enabled);

    return (
        <div className="w-full max-w-[760px]">
            <OnboardingWizard allSteps={enabledSteps} />
        </div>
    );
}

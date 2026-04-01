"use client";

import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";

interface StepProps {
    stepConfig: OnboardingStep;
}

export function RoleSelectionStep({ stepConfig }: StepProps) {
    const { formData, setFormData, goNext, goBack } = useOnboardingStore();
    const displayRoles = stepConfig.content.roles || [];

    const title = stepConfig.content.title || "Choose Your Plan";
    const subtitle = stepConfig.content.subtitle || "How do you plan to use Alora?";

    const handleRoleSelect = (roleKey: string) => {
        const nextRole = roleKey as "USER" | "LANDLORD" | "AGENT";
        setFormData({
            role: nextRole,
            entityType: nextRole === "AGENT" ? "business" : undefined,
            operatingLocations: nextRole === "USER" ? undefined : formData.operatingLocations,
            numberOfProperties: nextRole === "USER" ? undefined : formData.numberOfProperties,
        });
    };

    const onSubmit = () => {
        goNext();
    };

    return (
        <div className="auth-card animate-in w-full p-8 duration-500 fade-in slide-in-from-bottom-4 md:p-10">
            <div className="mb-8">
                <h2 className="auth-title mb-3 text-left text-[34px]">{title}</h2>
                <p className="text-left text-[16px] leading-[150%] text-[#5f6368]">{subtitle}</p>
            </div>

            <div className="space-y-4 mb-10">
                {displayRoles.map((role) => {
                    const isSelected = formData.role === role.key || (!formData.role && role.key === 'USER'); // defaulting tenant for visual match
                    return (
                        <div
                            key={role.key}
                            onClick={() => handleRoleSelect(role.key)}
                            className={`rounded-[20px] border cursor-pointer p-5 transition-all duration-200
                ${isSelected
                                    ? 'border-[#95d4e9] bg-[#f7fbfd] shadow-[0_12px_32px_rgba(139,204,230,0.14)]'
                                    : 'border-[#e4e8f0] bg-white hover:border-[#c7d2e1] hover:bg-[#fafcff]'
                                }
              `}
                        >
                            <h3 className="mb-1 text-[20px] font-semibold text-[#202124]">
                                {role.label}
                            </h3>
                            <p className="text-sm leading-[150%] text-[#5f6368]">
                                {role.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={goBack}
                    className="auth-button-secondary h-10 px-6"
                >
                    Back
                </button>
                <button
                    onClick={onSubmit}
                    className="auth-button-primary h-10 px-6"
                >
                    {(formData.role || "USER") === "USER" ? "Complete" : "Continue"}
                </button>
            </div>
        </div>
    );
}

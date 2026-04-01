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
        setFormData({ role: roleKey as "USER" | "LANDLORD" | "AGENT" });
    };

    const onSubmit = () => {
        goNext();
    };

    return (
        <div className="bg-white rounded-3xl shadow-lg p-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 pl-1">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
            </div>

            <div className="space-y-4 mb-10">
                {displayRoles.map((role) => {
                    const isSelected = formData.role === role.key || (!formData.role && role.key === 'USER'); // defaulting tenant for visual match
                    return (
                        <div
                            key={role.key}
                            onClick={() => handleRoleSelect(role.key)}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                ${isSelected
                                    ? 'border-[#C1E2ED] bg-[#F7FBFD]'
                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                }
              `}
                        >
                            <h3 className="font-bold text-[15px] text-gray-900 mb-1 tracking-wide">
                                {role.label}
                            </h3>
                            <p className="text-sm font-medium text-gray-500">
                                {role.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={goBack}
                    className="h-10 px-6 rounded-lg border border-gray-200 bg-white font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    Back
                </button>
                <button
                    onClick={onSubmit}
                    className="h-10 px-6 rounded-lg text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                >
                    {(formData.role || "USER") === "USER" ? "Complete" : "Continue"}
                </button>
            </div>
        </div>
    );
}

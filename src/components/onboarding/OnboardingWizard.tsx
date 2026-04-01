"use client";

import { useEffect } from "react";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";
import { StepProgress } from "./StepProgress";

// Step Feature Imports
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { RoleSelectionStep } from "./steps/RoleSelectionStep";
import { EntityTypeStep } from "./steps/EntityTypeStep";
import { BusinessProfileStep } from "./steps/BusinessProfileStep";
import { PlanSelectionStep } from "./steps/PlanSelectionStep";
import { CompletionStep } from "./steps/CompletionStep";

interface OnboardingWizardProps {
    allSteps: OnboardingStep[];
}

export function OnboardingWizard({ allSteps }: OnboardingWizardProps) {
    const { currentStepIndex, activeSteps, setActiveSteps, formData } = useOnboardingStore();

    // Dynamic step re-calculation based on selected role and entity type state changes
    useEffect(() => {
        const role = formData.role || "USER"; // default assumes lowest/entry role
        const entityType = formData.entityType;

        const filteredSteps = allSteps.filter(step => {
            // visibleForRoles: [] = show for all roles
            if (step.visibleForRoles && step.visibleForRoles.length > 0 && !step.visibleForRoles.includes(role)) {
                return false;
            }
            if (step.key === "completion" && ["LANDLORD", "AGENT"].includes(role)) {
                return false;
            }
            if (step.key === "entity_type" && role === "AGENT") {
                return false;
            }
            // logic specifically requested for business profile step exclusion
            if (step.key === "business_profile" && entityType !== "business") {
                return false;
            }
            return true;
        });

        setActiveSteps(filteredSteps);
    }, [allSteps, formData.role, formData.entityType, setActiveSteps]);

    if (activeSteps.length === 0) return null;

    const currentStep = activeSteps[currentStepIndex];

    // Render logic mapping enum keys to actual React Components
    const renderStep = () => {
        if (!currentStep) return null;

        switch (currentStep.key) {
            case "personal_information":
                return <PersonalInfoStep stepConfig={currentStep} />;
            case "role_selection":
                return <RoleSelectionStep stepConfig={currentStep} />;
            case "entity_type":
                return <EntityTypeStep stepConfig={currentStep} />;
            case "business_profile":
                return <BusinessProfileStep stepConfig={currentStep} />;
            case "plan_selection":
                return <PlanSelectionStep stepConfig={currentStep} />;
            case "completion":
                return <CompletionStep stepConfig={currentStep} />;
            default:
                // Fallback for unknown dynamic keys
                return (
                    <div className="p-8 text-center text-gray-500">
                        Unknown step type: {currentStep.key}
                    </div>
                );
        }
    };

    return (
        <div className="w-full">
            <StepProgress
                activeSteps={activeSteps}
                currentIndex={currentStepIndex}
                currentStepKey={currentStep?.key}
                role={formData.role}
            />
            <div className="mt-8 transition-all ease-in-out duration-300">
                {renderStep()}
            </div>
        </div>
    );
}

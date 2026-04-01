import { create } from 'zustand';

// Based on the provided prompt contracts
export interface OnboardingStep {
    stepNumber: number;
    key: string;
    name: string;
    enabled: boolean;
    required: boolean;
    visibleForRoles: string[];
    content: {
        title: string;
        subtitle: string;
        body: string;
        fields: { key: string; label: string; placeholder: string; required: boolean; enabled: boolean }[];
        roles?: { key: string; label: string; description: string }[];
        entityOptions?: { key: string; label: string; description: string; features: string[] }[];
    };
}

interface OnboardingStore {
    // Step tracking
    currentStepIndex: number;
    activeSteps: OnboardingStep[];

    // Collected form data
    formData: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        password?: string;
        confirmPassword?: string;
        role?: 'USER' | 'LANDLORD' | 'AGENT';
        entityType?: 'individual' | 'business';
        businessName?: string;
        aboutBusiness?: string;
        operatingLocations?: string[];
        numberOfProperties?: number;
        planId?: string;
    };

    // Actions
    setFormData: (data: Partial<OnboardingStore['formData']>) => void;
    goNext: () => void;
    goBack: () => void;
    setActiveSteps: (steps: OnboardingStep[]) => void;
    setCurrentStepIndex: (index: number) => void;
    reset: () => void;
}

const initialState = {
    currentStepIndex: 0,
    activeSteps: [],
    formData: {},
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
    ...initialState,

    setFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),

    goNext: () =>
        set((state) => ({
            currentStepIndex: Math.min(state.currentStepIndex + 1, state.activeSteps.length - 1)
        })),

    goBack: () =>
        set((state) => ({
            currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
        })),

    setActiveSteps: (steps) => set({ activeSteps: steps }),

    setCurrentStepIndex: (index) => set({ currentStepIndex: index }),

    reset: () => set(initialState),
}));

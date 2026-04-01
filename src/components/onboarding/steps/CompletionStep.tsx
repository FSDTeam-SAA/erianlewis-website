"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface StepProps {
    stepConfig: OnboardingStep;
}

export function CompletionStep({ stepConfig }: StepProps) {
    const { formData, goBack } = useOnboardingStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { title, subtitle } = stepConfig.content;

    const buildPayload = () => {
        if (formData.role === "LANDLORD" || formData.role === "AGENT") {
            if (formData.entityType === "individual") {
                return {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    role: formData.role,
                    entityType: formData.entityType,
                    individual: {
                        operatingLocations: formData.operatingLocations || [],
                        numberOfProperties: formData.numberOfProperties,
                    },
                    planId: formData.planId,
                };
            }

            return {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                role: formData.role,
                entityType: formData.entityType,
                business: {
                    businessName: formData.businessName,
                    aboutBusiness: formData.aboutBusiness,
                    operatingLocations: formData.operatingLocations || [],
                    numberOfProperties: formData.numberOfProperties,
                },
                planId: formData.planId,
            };
        }

        return {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            role: formData.role || "USER",
        };
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await api.post("/auth/register", buildPayload());
            const responseData = res.data?.data;

            if (responseData?.requiresPayment && responseData?.stripeUrl) {
                window.location.href = responseData.stripeUrl;
                return;
            }

            toast.success("Account created successfully!");
            const query = new URLSearchParams({ email: formData.email || "" });
            router.push(`/verify-otp?${query.toString()}`);
        } catch (error: unknown) {
            const message =
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof error.response === "object" &&
                error.response !== null &&
                "data" in error.response &&
                typeof error.response.data === "object" &&
                error.response.data !== null &&
                "message" in error.response.data
                    ? String(error.response.data.message)
                    : "Registration failed. Please try again.";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{title}</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed mb-10">
                {subtitle}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 text-left max-w-sm mx-auto mb-10 border border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Review Details</h4>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-semibold text-gray-900">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-semibold text-gray-900">{formData.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Account Type:</span>
                        <span className="font-semibold text-[#E8825A] capitalize">{formData.role?.toLowerCase()}</span>
                    </div>
                    {formData.entityType && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Entity:</span>
                            <span className="font-semibold text-gray-900 capitalize">{formData.entityType}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button
                    variant="outline"
                    onClick={goBack}
                    disabled={loading}
                    className="w-full sm:w-auto rounded-full px-8 border-gray-300 text-gray-700 hover:bg-gray-50 h-12"
                >
                    Wait, go back
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full sm:w-auto bg-[#E8825A] text-white hover:bg-[#d6714a] rounded-full px-10 h-12 text-base font-semibold shadow-md"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Complete Registration"
                    )}
                </Button>
            </div>
        </div>
    );
}

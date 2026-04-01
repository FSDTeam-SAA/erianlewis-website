"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";

interface StepProps {
    stepConfig: OnboardingStep;
}

interface Plan {
    _id: string;
    name: string;
    title: string;
    price: number;
    billingCycle: string;
    maxProperties: number | null;
}

export function CompletionStep({ stepConfig }: StepProps) {
    const { formData, goBack } = useOnboardingStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { title, subtitle } = stepConfig.content;

    const isPaidRole = formData.role === "LANDLORD" || formData.role === "AGENT";

    const { data: plans = [] } = useQuery({
        queryKey: ["plans", formData.role, "completion"],
        queryFn: async () => {
            const res = await api.get("/plans", {
                params: {
                    status: "active",
                    role: formData.role,
                },
            });
            return (res.data?.data?.items || []) as Plan[];
        },
        enabled: Boolean(formData.role && isPaidRole),
    });

    const selectedPlan = useMemo(
        () => plans.find((plan) => plan._id === formData.planId),
        [formData.planId, plans]
    );

    const buildPayload = () => {
        const phone = formData.phone
            ? `${formData.countryCode || "+1"} ${formData.phone}`.trim()
            : "";

        if (formData.role === "LANDLORD" || formData.role === "AGENT") {
            if (formData.entityType === "individual") {
                return {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone,
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
                phone,
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
            phone,
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
        <div className="mx-auto w-full max-w-[640px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="auth-card p-6 md:p-8">
                <div className="mb-6">
                    <h2 className="mb-2 text-[28px] font-semibold leading-[120%] text-[#202124]">{title}</h2>
                    <p className="text-[14px] leading-[150%] text-[#5f6368]">{subtitle}</p>
                </div>

                <div className="mb-4 rounded-[16px] border border-[#e8edf3] bg-[#f8fafc] p-4">
                    <div className="mb-1 text-[14px] font-medium text-[#202124]">
                        {selectedPlan?.name || "Selected plan"}
                    </div>
                    <div className="text-[12px] text-[#5f6368]">
                        {selectedPlan
                            ? `${selectedPlan.price === 0 ? "Free" : `$${selectedPlan.price}/${selectedPlan.billingCycle.toLowerCase()}`} • ${selectedPlan.maxProperties === null ? "Unlimited properties" : `Up to ${selectedPlan.maxProperties} properties`}`
                            : "Your selected subscription will be applied after registration."}
                    </div>
                </div>

                {isPaidRole && (
                    <div className="mb-5 rounded-[16px] border border-[#e8edf3] bg-white p-4">
                        <div className="mb-1 text-[14px] font-medium text-[#202124]">Payment</div>
                        <div className="mb-4 text-[11px] text-[#7b8595]">Stripe checkout is a new window.</div>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#171717] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                            Pay with Stripe
                        </button>
                    </div>
                )}

                {isPaidRole && (
                    <div className="mb-5 rounded-[10px] bg-[#fff7f2] px-4 py-3 text-center text-[11px] text-[#f6855c]">
                        Please complete payment to continue
                    </div>
                )}

                {!isPaidRole && (
                    <div className="mb-5 rounded-[16px] border border-[#e8edf3] bg-[#f8fafc] p-4 text-sm text-[#5f6368]">
                        We&apos;ll create your account and take you to email verification next.
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={goBack}
                        disabled={loading}
                        className="auth-button-secondary h-10 px-6"
                    >
                        Back
                    </button>
                    {!isPaidRole && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="auth-button-primary h-10 px-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Completing...
                                </>
                            ) : (
                                "Complete"
                            )}
                        </button>
                    )}
                    {isPaidRole && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="auth-button-primary h-10 px-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Redirecting...
                                </>
                            ) : (
                                "Complete"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

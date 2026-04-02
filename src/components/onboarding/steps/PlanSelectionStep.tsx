"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Loader2, ServerCrash } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";

interface Plan {
    _id: string;
    title: string;
    name: string;
    price: number;
    billingCycle: string;
    targetRoles: string[];
    maxProperties: number | null;
    displayFeatures: string[];
    status: string;
}

interface StepProps {
    stepConfig: OnboardingStep;
}

const formatPlanName = (plan: Plan) => {
    const rawName = plan.title?.trim() || plan.name?.trim() || "Plan";
    return rawName
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function PlanSelectionStep({ stepConfig }: StepProps) {
    const { formData, setFormData, goNext, goBack } = useOnboardingStore();
    const router = useRouter();
    const { title } = stepConfig.content;
    const [propertyCount, setPropertyCount] = useState(formData.numberOfProperties || 1);
    const [loading, setLoading] = useState(false);

    const isPaidRole = formData.role === "LANDLORD" || formData.role === "AGENT";
    const subtitle = isPaidRole
        ? `Pick a plan for your ${formData.role === "LANDLORD" ? "landlord" : "agent"} account.`
        : stepConfig.content.subtitle;

    const { data, isLoading, isError } = useQuery({
        queryKey: ["plans", formData.role],
        queryFn: async () => {
            const res = await api.get("/plans", {
                params: {
                    status: "active",
                    role: formData.role,
                },
            });
            return (res.data?.data?.items || []) as Plan[];
        },
    });

    const sortedPlans = useMemo(() => {
        return [...(data || [])].sort((a, b) => {
            const aLimit = a.maxProperties ?? Number.POSITIVE_INFINITY;
            const bLimit = b.maxProperties ?? Number.POSITIVE_INFINITY;
            return aLimit - bLimit;
        });
    }, [data]);

    const recommendedPlan = useMemo(() => {
        return sortedPlans.find((plan) => plan.maxProperties === null || propertyCount <= plan.maxProperties) || sortedPlans[0];
    }, [propertyCount, sortedPlans]);

    useEffect(() => {
        setFormData({ numberOfProperties: propertyCount });
    }, [propertyCount, setFormData]);

    useEffect(() => {
        if (!formData.planId && recommendedPlan?._id) {
            setFormData({ planId: recommendedPlan._id });
        }
    }, [formData.planId, recommendedPlan, setFormData]);

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
                        numberOfProperties: propertyCount,
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
                    numberOfProperties: propertyCount,
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

    const handleContinue = async () => {
        if (!isPaidRole) {
            goNext();
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/register", buildPayload());
            const responseData = res.data?.data;

            if (responseData?.requiresPayment && responseData?.stripeUrl) {
                window.location.href = responseData.stripeUrl;
                return;
            }

            toast.success("Account created successfully!");
            const query = new URLSearchParams({ email: formData.email || "", registered: "1" });
            router.push(`/sign-in?${query.toString()}`);
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
        <div className="mx-auto w-full max-w-[760px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="auth-card p-6 md:p-8">
                <div className="mb-6">
                    <h2 className="mb-2 text-[28px] font-semibold leading-[120%] text-[#202124]">{title}</h2>
                    <p className="text-[14px] leading-[140%] text-[#5f6368]">{subtitle}</p>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center rounded-[18px] bg-[#f8fafc] p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#8BCCE6]" />
                        <p className="mt-4 text-sm text-[#5f6368]">Fetching available plans...</p>
                    </div>
                )}

                {isError && (
                    <div className="rounded-[18px] border border-[#fde4db] bg-white p-10 text-center">
                        <ServerCrash className="mx-auto mb-4 h-10 w-10 text-[#f6855c]" />
                        <p className="text-base font-medium text-[#202124]">Failed to load plans</p>
                        <p className="mt-1 text-sm text-[#5f6368]">Please try again later or contact support.</p>
                    </div>
                )}

                {!isLoading && !isError && (
                    <>
                        <div className="mb-6 rounded-[16px] bg-[#f8fafc] p-4">
                            <div className="mb-2 text-[14px] font-medium text-[#202124]">
                                Number of properties: {propertyCount}
                            </div>
                            <input
                                type="range"
                                min={1}
                                max={50}
                                value={propertyCount}
                                onChange={(e) => setPropertyCount(Number(e.target.value))}
                                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-[#3d8ed8]"
                            />
                            <p className="mt-2 text-[11px] text-[#7b8595]">
                                Adjust if needed to see the recommended plan.
                            </p>
                        </div>

                        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                            {sortedPlans.map((plan) => {
                                const isSelected = formData.planId === plan._id;
                                const isRecommended = recommendedPlan?._id === plan._id;
                                return (
                                    <button
                                        type="button"
                                        key={plan._id}
                                        onClick={() => setFormData({ planId: plan._id })}
                                        className={`relative rounded-[16px] border bg-white p-4 text-left transition-all ${isSelected
                                            ? "border-[#95d4e9] shadow-[0_16px_32px_rgba(139,204,230,0.18)]"
                                            : "border-[#e5e7eb] hover:border-[#cdd5df]"
                                            }`}
                                    >
                                        {isRecommended && (
                                            <span className="mb-3 inline-flex rounded-full bg-[#e7f9ee] px-3 py-1 text-[10px] font-medium text-[#4db56b]">
                                                Recommended
                                            </span>
                                        )}
                                        <div className="text-[24px] font-semibold text-[#202124]">{formatPlanName(plan)}</div>
                                        <div className="mt-1 text-[15px] font-semibold text-[#F6855C]">
                                            {plan.price === 0 ? "Free" : `$${plan.price}/${plan.billingCycle.toLowerCase()}`}
                                        </div>
                                        <div className="mt-3 text-[13px] leading-[150%] text-[#4b5563]">
                                            {plan.maxProperties === null ? "Unlimited properties" : `Up to ${plan.maxProperties} properties`}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {isPaidRole && (
                            <>
                                <div className="mb-4 rounded-[16px] border border-[#e8edf3] bg-white p-4">
                                    <div className="mb-1 text-[14px] font-medium text-[#202124]">Payment</div>
                                    <div className="mb-4 text-[11px] text-[#7b8595]">Stripe opens in a new window.</div>
                                    <button
                                        type="button"
                                        onClick={handleContinue}
                                        disabled={loading || !formData.planId}
                                        className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#171717] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                                        Pay with Stripe
                                    </button>
                                </div>

                                <div className="mb-5 rounded-[10px] bg-[#fff7f2] px-4 py-3 text-center text-[11px] text-[#f6855c]">
                                    Please complete payment to continue
                                </div>
                            </>
                        )}

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={goBack}
                                className="auth-button-secondary h-10 px-6"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleContinue}
                                disabled={!formData.planId || loading}
                                className="auth-button-primary h-10 px-6"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isPaidRole ? "Redirecting..." : "Continuing..."}
                                    </>
                                ) : isPaidRole ? (
                                    "Complete"
                                ) : (
                                    "Continue"
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

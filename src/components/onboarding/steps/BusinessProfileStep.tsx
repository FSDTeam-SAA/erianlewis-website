"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";
import { IslandMultiSelect } from "../IslandMultiSelect";

interface Island {
    _id: string;
    name: string;
}

interface StepProps {
    stepConfig: OnboardingStep;
}

const schema = z.object({
    businessName: z.string().min(1, "Business name is required"),
    aboutBusiness: z.string().min(1, "About your business is required"),
    operatingLocations: z.array(z.string()).min(1, "Operating location is required"),
});

type BusinessProfileValues = z.infer<typeof schema>;

export function BusinessProfileStep({ stepConfig }: StepProps) {
    const { formData, setFormData, goNext, goBack } = useOnboardingStore();
    const { title, subtitle } = stepConfig.content;

    const {
        data: islands = [],
        isError: islandsFailed,
    } = useQuery({
        queryKey: ["business-islands"],
        queryFn: async () => {
            const res = await api.get("/islands", { params: { limit: 100 } });
            return (res.data?.data?.islands || []) as Island[];
        },
        retry: 0,
    });

    const sortedIslands = useMemo(
        () => [...islands].sort((a, b) => a.name.localeCompare(b.name)),
        [islands]
    );

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BusinessProfileValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            businessName: formData.businessName || "",
            aboutBusiness: formData.aboutBusiness || "",
            operatingLocations: formData.operatingLocations || [],
        },
    });

    const selectedLocations = watch("operatingLocations") || [];

    const onSubmit = (data: BusinessProfileValues) => {
        setFormData({
            ...data,
            numberOfProperties: formData.numberOfProperties || 1,
        });
        goNext();
    };

    return (
        <div className="mx-auto w-full max-w-[640px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="auth-card p-6 md:p-8">
                <div className="mb-8">
                    <h2 className="mb-3 text-[44px] font-semibold leading-[120%] text-[#202124]">{title}</h2>
                    <p className="max-w-[470px] text-[20px] leading-[140%] text-[#5f6368]">{subtitle}</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <label className="auth-label">
                            Business Name<span className="text-[#E8825A]">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Business name"
                            {...register("businessName")}
                            className={`auth-input auth-input-left bg-white text-left ${errors.businessName ? "border-[#f6855c]" : ""}`}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="auth-label">
                            About Your Business<span className="text-[#E8825A]">*</span>
                        </label>
                        <textarea
                            placeholder="What should clients know about your business?"
                            {...register("aboutBusiness")}
                            className={`min-h-[104px] w-full rounded-lg border bg-white px-4 py-4 text-left text-[14px] leading-[120%] text-[#202124] outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#8BCCE6] ${errors.aboutBusiness ? "border-[#f6855c]" : "border-[#d7dde7]"}`}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="auth-label">
                            Operating Location(s)<span className="text-[#E8825A]">*</span>
                        </label>
                        <IslandMultiSelect
                            options={sortedIslands}
                            value={selectedLocations}
                            onChange={(next) => setValue("operatingLocations", next, { shouldValidate: true })}
                            placeholder="Select island"
                            helperText={islandsFailed ? "Island list could not be loaded from the API right now." : "Select the islands you operate in."}
                            error={errors.operatingLocations?.message}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={goBack}
                            className="auth-button-secondary h-10 px-6"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={islandsFailed}
                            className="auth-button-primary h-10 px-6"
                        >
                            Continue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

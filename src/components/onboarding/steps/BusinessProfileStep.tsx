"use client";

import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/axios";

interface Island {
    _id: string;
    name: string;
}

interface StepProps {
    stepConfig: OnboardingStep;
}

export function BusinessProfileStep({ stepConfig }: StepProps) {
    const { formData, setFormData, goNext, goBack } = useOnboardingStore();
    const { title, subtitle, fields } = stepConfig.content;
    const { data: islands = [] } = useQuery({
        queryKey: ["business-islands"],
        queryFn: async () => {
            const res = await api.get("/islands", { params: { limit: 100 } });
            return (res.data?.data?.islands || []) as Island[];
        },
    });

    const generateSchema = () => {
        const shape: Record<string, z.ZodTypeAny> = {};
        fields?.forEach((f) => {
            if (!f.enabled) return;

            if (f.key === "operatingLocations") {
                shape[f.key] = f.required
                    ? z.array(z.string()).min(1, f.label + " is required").default([])
                    : z.array(z.string()).default([]);
            } else if (f.key === "numberOfProperties") {
                shape[f.key] = z.coerce.number().min(0, "Invalid number").default(0);
            } else {
                shape[f.key] = f.required
                    ? z.string().min(1, f.label + " is required").default("")
                    : z.string().optional();
            }
        });

        return z.object(shape);
    };

    const schema = generateSchema();

    const buildDefaultValues = () => {
        const defaults: Record<string, string | string[] | number> = {};
        fields?.forEach((f) => {
            if (f.key === "operatingLocations") {
                defaults[f.key] = formData.operatingLocations || [];
            } else if (f.key === "numberOfProperties") {
                defaults[f.key] = formData.numberOfProperties || 0;
            } else {
                defaults[f.key] = (formData[f.key as keyof typeof formData] as string) || "";
            }
        });
        return defaults;
    };

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: buildDefaultValues()
    });

    const selectedLocations = (watch("operatingLocations") ?? []) as string[];

    const toggleLocation = (loc: string) => {
        if (selectedLocations.includes(loc)) {
            setValue("operatingLocations", selectedLocations.filter((l: string) => l !== loc));
        } else {
            setValue("operatingLocations", [...selectedLocations, loc]);
        }
    };

    const onSubmit = (data: Record<string, unknown>) => {
        setFormData(data as Partial<typeof formData>);
        goNext();
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 text-sm">{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {fields?.map((field) => {
                    if (!field.enabled) return null;

                    if (field.key === "aboutBusiness" || field.key === "description") {
                        const fieldName = field.key;
                        return (
                            <div key={field.key} className="space-y-1.5">
                                <Label htmlFor={field.key} className="text-[13px] text-gray-700 font-bold">
                                    {field.label} {field.required && <span className="text-[#E8825A]">*</span>}
                                </Label>
                                <Textarea
                                    id={field.key}
                                    placeholder={field.placeholder}
                                    {...register(fieldName)}
                                    className={`w-full min-h-[100px] rounded-xl border-gray-200 outline-none focus:border-[#8BCCE6] text-sm ${errors[fieldName] ? 'border-red-500 focus-visible:border-red-500' : ''}`}
                                />
                                {errors[fieldName] && (
                                    <p className="text-[11px] text-red-500 mt-1 font-medium">{errors[fieldName]?.message?.toString()}</p>
                                )}
                            </div>
                        );
                    }

                    if (field.key === "operatingLocations") {
                        return (
                            <div key={field.key} className="space-y-3">
                                <Label className="text-[13px] text-gray-700 font-bold">
                                    {field.label} {field.required && <span className="text-[#E8825A]">*</span>}
                                </Label>
                                <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto p-4 border rounded-xl border-gray-100">
                                    {islands.map((loc) => {
                                        const isSelected = selectedLocations.includes(loc._id);
                                        return (
                                            <button
                                                type="button"
                                                key={loc._id}
                                                onClick={() => toggleLocation(loc._id)}
                                                className={`text-xs px-4 py-2 rounded-full transition-colors border ${isSelected
                                                    ? 'bg-white text-gray-800 border-gray-300'
                                                    : 'bg-white text-gray-400 border-gray-200'
                                                    }`}
                                            >
                                                {loc.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.operatingLocations && (
                                    <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.operatingLocations?.message?.toString()}</p>
                                )}
                            </div>
                        );
                    }

                    return (
                        <div key={field.key} className="space-y-1.5">
                            <Label htmlFor={field.key} className="text-[13px] text-gray-700 font-bold">
                                {field.label} {field.required && <span className="text-[#E8825A]">*</span>}
                            </Label>
                            <Input
                                {...register(field.key)}
                                id={field.key}
                                type={field.key === 'numberOfProperties' ? 'number' : 'text'}
                                placeholder={field.placeholder}
                                className={`w-full h-11 border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#8BCCE6] transition-colors font-medium placeholder:text-gray-300 ${errors[field.key] ? 'border-red-500 focus-visible:border-red-500' : ''}`}
                            />
                            {errors[field.key] && (
                                <p className="text-[11px] text-red-500 mt-1 font-medium">{errors[field.key]?.message?.toString()}</p>
                            )}
                        </div>
                    );
                })}

                <div className="pt-8 flex justify-between items-center bg-white">
                    <button
                        type="button"
                        onClick={goBack}
                        className="h-10 px-6 rounded-full border border-gray-200 bg-white font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="h-10 px-8 rounded-full text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";
import { toast } from "sonner";

interface StepProps {
    stepConfig: OnboardingStep;
}

export function PersonalInfoStep({ stepConfig }: StepProps) {
    const { formData, setFormData, goNext, goBack } = useOnboardingStore();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { title, subtitle } = stepConfig.content;

    const schema = z.object({
        firstName: z.string().min(1, "Please enter your first name"),
        lastName: z.string().min(1, "Please enter your last name"),
        countryCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password too short"),
        confirmPassword: z.string(),
        agreePolicy: z.boolean().refine(val => val === true, "You must agree to the Privacy Policy"),
        agreeTerms: z.boolean().refine(val => val === true, "You must agree to the Terms of Service"),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    });

    type FormDataSchema = z.infer<typeof schema>;

    const { register, handleSubmit, formState: { errors } } = useForm<FormDataSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: formData.firstName || "",
            lastName: formData.lastName || "",
            email: formData.email || "",
            phone: formData.phone || "",
            agreePolicy: false,
            agreeTerms: false,
        }
    });

    const onSubmit = (data: FormDataSchema) => {
        setFormData(data);
        goNext();
    };

    return (
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 text-center">
                <h2 className="text-[26px] font-extrabold text-gray-900 mb-1">{title || "Create Your Account"}</h2>
                <p className="text-sm font-medium text-gray-500">{subtitle || "Let's get started with your Alora account."}</p>
            </div>

            <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => toast.message("Google sign up is not configured yet. Please use email and password for now.")}
                        className="w-full h-[46px] rounded-xl bg-white border border-gray-200 text-gray-800 font-bold text-sm tracking-wide hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Sign up with Google
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-bold text-gray-700 ml-1">First Name<span className="text-[#E8825A]">*</span></label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            {...register("firstName")}
                            className="w-full h-[46px] border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#8BCCE6] transition-colors font-medium placeholder:text-gray-300 placeholder:font-normal"
                        />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-xs font-bold text-gray-700 ml-1">Last Name<span className="text-[#E8825A]">*</span></label>
                        <input
                            type="text"
                            placeholder="Enter your last name"
                            {...register("lastName")}
                            className="w-full h-[46px] border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#8BCCE6] transition-colors font-medium placeholder:text-gray-300 placeholder:font-normal"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Phone Number<span className="text-[#E8825A]">*</span></label>
                    <div className="flex gap-2">
                        <div className="relative w-[150px]">
                            <select className="w-full h-[46px] border border-gray-200 rounded-xl px-3 text-xs font-bold text-gray-700 appearance-none bg-white outline-none focus:border-[#8BCCE6]">
                                <option>United States / Canada (+1)</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-gray-500">▼</div>
                        </div>
                        <input
                            type="tel"
                            placeholder="Digits only"
                            {...register("phone")}
                            className="flex-1 h-[46px] border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-[#8BCCE6] transition-colors font-medium placeholder:text-gray-300 placeholder:font-normal"
                        />
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium pl-1">
                        Select your island area code, then enter digits only
                    </div>
                </div>

                <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-gray-700 ml-1">Email Address<span className="text-[#E8825A]">*</span></label>
                    <input
                        type="email"
                        placeholder="you@gmail.com"
                        {...register("email")}
                        className="w-full h-[46px] bg-[#E6F0F4] border border-transparent focus:border-[#8BCCE6] rounded-xl px-4 text-sm outline-none transition-colors text-gray-800 font-medium placeholder:text-gray-500"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Password<span className="text-[#E8825A]">*</span></label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...register("password")}
                            className="w-full h-[46px] bg-[#E6F0F4] border border-transparent focus:border-[#8BCCE6] rounded-xl px-4 text-sm flex items-center tracking-widest outline-none transition-colors text-gray-800 font-medium placeholder:text-gray-500 pr-16"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-gray-900"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 ml-1">Confirm Password<span className="text-[#E8825A]">*</span></label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter your password"
                            {...register("confirmPassword")}
                            className="w-full h-[46px] border border-gray-200 focus:border-[#8BCCE6] rounded-xl px-4 text-sm outline-none transition-colors text-gray-800 font-medium placeholder:text-gray-300 placeholder:font-normal pr-16"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-gray-900"
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <div className="space-y-3 pt-2 pb-2 pl-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            {...register("agreePolicy")}
                            className="w-[18px] h-[18px] rounded border-gray-300 text-[#E8825A] focus:ring-[#E8825A] accent-[#E8825A] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">I agree to the Privacy Policy.</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            {...register("agreeTerms")}
                            className="w-[18px] h-[18px] rounded border-gray-300 text-[#E8825A] focus:ring-[#E8825A] accent-[#E8825A] cursor-pointer"
                        />
                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">I agree to the Terms of Service.</span>
                    </label>
                </div>

                {Object.keys(errors).length > 0 && (
                    <div className="w-full bg-[#FFF6F4] text-[#E8825A] text-xs font-bold py-2.5 rounded-lg text-center shadow-sm">
                        {Object.values(errors)[0]?.message as React.ReactNode}
                    </div>
                )}

                <div className="flex justify-between items-center pt-2">
                    <button
                        type="button"
                        onClick={goBack}
                        className="h-10 px-6 rounded-lg border border-gray-200 bg-white font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="h-10 px-6 rounded-lg text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                    >
                        Continue
                    </button>
                </div>
            </form>
        </div>
    );
}

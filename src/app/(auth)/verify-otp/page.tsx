"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import api from "@/lib/axios";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function VerifyOtpPage() {
    const router = useRouter();
    const { formData, reset } = useOnboardingStore();

    const [email, setEmail] = useState("you@gmail.com");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get("email") || "you@gmail.com");
    }, []);

    const handleVerify = async () => {
        if (code.length !== 6) {
            toast.error("Please enter the 6-digit code");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/verify-otp", { email, otp: code });
            toast.success("Verified successfully!");

            if (formData.email === email && formData.password) {
                const result = await signIn("credentials", {
                    email,
                    password: formData.password,
                    redirect: false,
                    callbackUrl: "/dashboard",
                });

                reset();

                if (!result?.error) {
                    router.push(result?.url || "/dashboard");
                    return;
                }
            }

            router.push(`/sign-in?verified=1&email=${encodeURIComponent(email)}`);
        } catch {
            toast.error("Invalid code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await api.post("/auth/resend-otp", { email });
            toast.success("New code sent.");
            setCode("");
        } catch {
            toast.error("Failed to resend code.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="w-full max-w-[480px] bg-white rounded-3xl p-8 md:p-10 shadow-lg relative mx-auto my-auto animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">

            <div className="flex justify-center mb-6">
                <Image src="/logo.png" alt="Alora Logo" width={80} height={80} className="object-contain" />
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 mt-4 flex justify-center w-full min-w-max mx-auto px-4 !whitespace-nowrap">Verify your email</h1>
            <p className="text-sm font-medium text-gray-600 mb-8 max-w-[280px] mx-auto leading-relaxed">
                Enter the 6 digit code to unlock your dashboard.
            </p>

            <div className="space-y-4 text-left">
                {/* Mocking the two informational bands from the image */}
                <div className="w-full bg-[#FAFAFA] text-gray-500 text-xs font-semibold px-4 py-3 rounded-xl">
                    We sent a 6 digit code to {email}
                </div>

                <div className="w-full bg-[#F0FDF4] text-green-600 text-xs font-semibold px-4 py-3 rounded-xl">
                    We sent a 6 digit code to your email.
                </div>

                <div className="space-y-2 mt-6">
                    <label className="text-xs font-semibold text-gray-700 ml-1">Verification code</label>
                    <input
                        type="text"
                        className="w-full h-[52px] border border-gray-200 rounded-xl px-4 text-base tracking-[0.3em] font-medium outline-none focus:border-[#8BCCE6] transition-colors"
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={6}
                    />
                </div>

                <div className="flex items-center gap-3 pt-4">
                    <button
                        onClick={handleVerify}
                        disabled={loading || code.length !== 6}
                        className="flex-1 h-11 rounded-xl text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center"
                        style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & go to dashboard"}
                    </button>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="flex-1 h-11 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-70"
                    >
                        {resending ? "Sending..." : "Resend code"}
                    </button>
                </div>

                <div className="pt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            reset();
                            router.push("/sign-in");
                        }}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors underline-offset-4 hover:underline"
                    >
                        Sign out
                    </button>
                    <p className="text-xs text-gray-400 font-medium mt-4">
                        After verification, you&apos;ll go straight to your dashboard.
                    </p>
                </div>

            </div>
        </div>
    );
}

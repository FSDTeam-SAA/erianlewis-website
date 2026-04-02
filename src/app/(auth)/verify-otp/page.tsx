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
    const [mode, setMode] = useState<"verify" | "reset">("verify");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get("email") || "you@gmail.com");
        setMode(params.get("mode") === "reset" ? "reset" : "verify");
    }, []);

    const handleVerify = async () => {
        if (code.length !== 6) {
            toast.error("Please enter the 6-digit code");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/verify-code", { email, otp: code });
            toast.success(mode === "reset" ? "Code verified successfully!" : "Verified successfully!");

            if (mode === "reset") {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
                return;
            }

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
            await api.post("/auth/forget-password", { email });
            toast.success("New code sent.");
            setCode("");
        } catch {
            toast.error("Failed to resend code.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-card mx-auto my-auto w-full max-w-[520px] p-8 text-center md:p-10">
            <div className="mb-6 flex justify-center">
                <Image src="/logo.png" alt="Alora Logo" width={80} height={80} className="object-contain" />
            </div>

            <h1 className="auth-title mb-3 text-[34px]">Verify your email</h1>
            <p className="mx-auto mb-8 max-w-[320px] text-[16px] font-normal leading-[140%] text-[#5f6368]">
                {mode === "reset"
                    ? "Enter the 6 digit code we sent to continue resetting your password."
                    : "Enter the 6 digit code to unlock your dashboard."}
            </p>

            <div className="space-y-4 text-left">
                <div className="rounded-xl bg-[#f7f9fc] px-4 py-3 text-xs font-medium text-[#8a93a3]">
                    We sent a 6 digit code to {email}
                </div>

                <div className="rounded-xl bg-[#eefbf2] px-4 py-3 text-xs font-medium text-[#46a964]">
                    We sent a 6 digit code to your gmail.
                </div>

                <div className="space-y-2 pt-2">
                    <label className="auth-label text-[14px]">Verification code</label>
                    <input
                        type="text"
                        className="h-[48px] w-full rounded-lg border border-[#d7dde7] bg-white px-4 text-left text-[14px] tracking-[0.35em] text-[#202124] outline-none transition-colors placeholder:text-[#9aa3b2] focus:border-[#8BCCE6]"
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                        maxLength={6}
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleVerify}
                        disabled={loading || code.length !== 6}
                        className="auth-button-primary h-10 flex-1 text-[12px]"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "reset" ? "Verify code" : "Verify & go to dashboard"}
                    </button>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="auth-button-secondary h-10 flex-1 text-[12px]"
                    >
                        {resending ? "Sending..." : "Resend code"}
                    </button>
                </div>

                <div className="pt-3 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            reset();
                            router.push(mode === "reset" ? "/forgot-password" : "/sign-in");
                        }}
                        className="text-sm font-medium text-[#7b8595] underline underline-offset-2 hover:text-[#202124]"
                    >
                        {mode === "reset" ? "Back" : "Sign out"}
                    </button>
                    <p className="mt-4 text-xs text-[#8a93a3]">
                        {mode === "reset"
                            ? "After verification, you can set a new password."
                            : "After verification, you&apos;ll go straight to your dashboard."}
                    </p>
                </div>
            </div>
        </div>
    );
}

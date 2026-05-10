"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import api from "@/lib/axios";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PendingVerificationContext {
    email: string;
    password?: string;
    requiresPayment?: boolean;
    stripeUrl?: string | null;
}

const getPostAuthPath = (role?: string) => (role === "USER" ? "/account" : "/dashboard");

export default function VerifyOtpPage() {
    const router = useRouter();
    const { formData, reset } = useOnboardingStore();

    const [email, setEmail] = useState("you@gmail.com");
    const [mode, setMode] = useState<"verify" | "reset">("verify");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [verificationContext, setVerificationContext] = useState<PendingVerificationContext | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const nextEmail = params.get("email") || "you@gmail.com";
        const nextMode = params.get("mode") === "reset" ? "reset" : "verify";

        setEmail(nextEmail);
        setMode(nextMode);

        if (nextMode === "verify") {
            const rawContext = window.sessionStorage.getItem(`pending-verification:${nextEmail}`);
            if (rawContext) {
                try {
                    setVerificationContext(JSON.parse(rawContext) as PendingVerificationContext);
                } catch {
                    window.sessionStorage.removeItem(`pending-verification:${nextEmail}`);
                }
            }
        }
    }, []);

    const handleVerify = async () => {
        if (code.length !== 6) {
            toast.error("Please enter the 6-digit code");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post("/auth/verify-code", { email, otp: code });
            const responseData = response.data?.data;
            toast.success(mode === "reset" ? "Code verified successfully!" : "Verified successfully!");

            if (mode === "reset") {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
                return;
            }

            if (verificationContext?.requiresPayment && verificationContext?.stripeUrl) {
                window.sessionStorage.removeItem(`pending-verification:${email}`);
                window.location.href = verificationContext.stripeUrl;
                return;
            }

            if (responseData?.accessToken) {
                const callbackUrl = getPostAuthPath(responseData?.user?.role);
                const result = await signIn("credentials", {
                    accessToken: responseData.accessToken,
                    refreshToken: responseData.refreshToken || "",
                    email,
                    redirect: false,
                    callbackUrl,
                });

                window.sessionStorage.removeItem(`pending-verification:${email}`);
                reset();

                if (!result?.error) {
                    router.push(result?.url || callbackUrl);
                    return;
                }
            }

            const passwordToUse =
                verificationContext?.password ||
                (formData.email === email ? formData.password : "");

            if (passwordToUse) {
                const callbackUrl = getPostAuthPath(responseData?.user?.role);
                const result = await signIn("credentials", {
                    email,
                    password: passwordToUse,
                    redirect: false,
                    callbackUrl,
                });

                window.sessionStorage.removeItem(`pending-verification:${email}`);
                reset();

                if (!result?.error) {
                    router.push(result?.url || callbackUrl);
                    return;
                }
            }

            router.push(`/sign-in?verified=1&email=${encodeURIComponent(email)}`);
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
                    : "Invalid code. Please try again.";

            toast.error(message);
        } finally {
            setLoading(false);
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

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleVerify}
                        disabled={loading || code.length !== 6}
                        className="auth-button-primary h-10 w-full text-[12px]"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : mode === "reset" ? (
                            "Verify code"
                        ) : verificationContext?.requiresPayment ? (
                            "Verify & continue to payment"
                        ) : (
                            "Verify & go home"
                        )}
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
                            : verificationContext?.requiresPayment
                                ? "After verification, you'll continue to Stripe checkout."
                                : "After verification, you'll go straight to your dashboard."}
                    </p>
                </div>
            </div>
        </div>
    );
}

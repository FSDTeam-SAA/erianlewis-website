"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

const getPostAuthPath = (role?: string) => (role === "USER" ? "/account" : "/dashboard");

export default function RegistrationSuccessClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [message, setMessage] = useState("We are confirming your payment and preparing your dashboard.");

    const signInFallbackHref = useMemo(() => "/dashboard", []);

    useEffect(() => {
        if (!sessionId) {
            setStatus("error");
            setMessage("We could not find your payment session. Please sign in manually.");
            return;
        }

        let isActive = true;
        let attempts = 0;

        const finalizeSession = async () => {
            attempts += 1;

            try {
                const response = await api.get("/auth/registration-session", {
                    params: {
                        session_id: sessionId,
                        t: Date.now(),
                    },
                    headers: {
                        "Cache-Control": "no-cache",
                        Pragma: "no-cache",
                    },
                });
                const responseData = response.data?.data;

                if (!isActive) {
                    return;
                }

                if (!responseData?.isReady) {
                    if (attempts >= 15) {
                        setStatus("ready");
                        setMessage("Your payment is received. If automatic sign in takes longer than usual, you can continue to your dashboard.");
                        return;
                    }

                    window.setTimeout(finalizeSession, 2000);
                    return;
                }

                const callbackUrl = getPostAuthPath(responseData?.user?.role);
                const result = await signIn("credentials", {
                    accessToken: responseData.accessToken,
                    refreshToken: responseData.refreshToken || "",
                    email: responseData?.user?.email || "",
                    redirect: false,
                    callbackUrl,
                });

                if (result?.error) {
                    throw new Error(result.error);
                }

                toast.success("Your account is ready.");
                router.replace(result?.url || callbackUrl);
            } catch (error: unknown) {
                if (!isActive) {
                    return;
                }

                const message =
                    typeof error === "object" &&
                    error !== null &&
                    "response" in error &&
                    typeof error.response === "object" &&
                    error.response !== null &&
                    "status" in error.response &&
                    error.response.status === 404
                        ? "We could not match this payment session yet. Please sign in manually if it does not finish in a moment."
                        : "Automatic sign in could not be completed. You can continue manually.";

                setStatus("error");
                setMessage(message);
            }
        };

        void finalizeSession();

        return () => {
            isActive = false;
        };
    }, [router, sessionId]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#f0d5c8] via-[#d9e8f0] to-[#c8dff0] flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-lg">
                <Image
                    src="/logo.png"
                    alt="Alora"
                    width={72}
                    height={72}
                    className="mx-auto h-[72px] w-[72px] object-contain"
                    priority
                />
                <h1 className="mt-6 text-3xl font-extrabold text-gray-900">Payment received</h1>
                <p className="mt-4 text-sm text-gray-500">{message}</p>

                {status === "loading" && (
                    <div className="mt-8 flex items-center justify-center gap-3 text-sm font-medium text-[#202124]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing you in...
                    </div>
                )}

                {status !== "loading" && (
                    <Link
                        href={signInFallbackHref}
                        className="mt-8 inline-flex h-12 items-center justify-center rounded-xl px-8 font-semibold text-white"
                        style={{ background: "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)" }}
                    >
                        Go to dashboard
                    </Link>
                )}
            </div>
        </main>
    );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function GoogleSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        const run = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");
            const callbackUrl = params.get("callbackUrl") || "/";
            const isPendingOnboarding =
                typeof window !== "undefined" &&
                window.sessionStorage.getItem("pending-google-onboarding") === "1";

            if (!token) {
                toast.error("Google sign in failed. Please try again.");
                router.replace("/sign-in");
                return;
            }

            if (isPendingOnboarding) {
                window.sessionStorage.removeItem("pending-google-onboarding");
                router.replace(`/register/complete?tempToken=${encodeURIComponent(token)}`);
                return;
            }

            const result = await signIn("credentials", {
                accessToken: token,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                toast.error(result.error);
                router.replace("/sign-in");
                return;
            }

            router.replace(result?.url || "/");
        };

        void run();
    }, [router]);

    return (
        <div className="auth-shell flex flex-col">
            <div className="relative z-10 flex flex-1 flex-col">
                <div className="px-4 pt-6 md:px-6 md:pt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#5f6368] transition-colors hover:text-[#202124]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
                <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 md:px-6 md:py-16">
                    <div className="auth-card mx-auto my-auto flex w-full max-w-[520px] items-center justify-center gap-3 p-8 text-center md:p-10">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium text-[#202124]">Signing you in with Google...</span>
                    </div>
                </main>
            </div>
        </div>
    );
}

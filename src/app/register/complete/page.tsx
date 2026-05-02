import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";

interface RegisterCompletePageProps {
    searchParams?: {
        tempToken?: string;
    };
}

export default function RegisterCompletePage({ searchParams }: RegisterCompletePageProps) {
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
                    <div className="mb-4 w-full max-w-[760px] text-center text-sm text-[#5f6368]">
                        Google sign-up successful. Complete the remaining onboarding steps to finish your account setup.
                    </div>
                    <OnboardingScreen googleTempToken={searchParams?.tempToken} />
                </main>
            </div>
        </div>
    );
}

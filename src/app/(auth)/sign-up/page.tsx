"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect immediately to the structured onboarding flow
        router.push("/onboarding");
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f0d5c8] via-[#d9e8f0] to-[#c8dff0] flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl animate-pulse">
                    A
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-2">
                    Preparing your setup...
                </h1>
                <p className="text-gray-500 text-sm">Redirecting to onboarding</p>
            </div>
        </div>
    );
}

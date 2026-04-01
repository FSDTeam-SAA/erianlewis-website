"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status !== "authenticated") {
            return;
        }

        if (session.user?.role === "USER") {
            router.replace("/account");
        }
    }, [router, session, status]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#E8825A]" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#f0d5c8] via-[#d9e8f0] to-[#c8dff0] flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg p-8 text-center">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em]">Dashboard</p>
                <h1 className="text-3xl font-extrabold text-gray-900 mt-3">
                    Welcome, {session?.user?.name || session?.user?.email}
                </h1>
                <p className="text-sm text-gray-500 mt-3">
                    Your {session?.user?.role === "LANDLORD" ? "landlord" : "agent"} account is signed in successfully.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <Link
                        href="/"
                        className="flex-1 h-12 rounded-xl border border-gray-200 text-gray-700 font-semibold flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        Go to homepage
                    </Link>
                    <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/sign-in" })}
                        className="flex-1 h-12 rounded-xl text-white font-semibold"
                        style={{ background: "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)" }}
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </main>
    );
}

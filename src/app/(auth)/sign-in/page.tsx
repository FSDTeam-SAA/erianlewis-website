"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get("email") || "");
    }, []);

    const handleCredentialSignIn = async () => {
        if (!email || !password) {
            toast.error("Please enter your email and password");
            return;
        }

        setLoading(true);
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/dashboard",
        });
        setLoading(false);

        if (result?.error) {
            toast.error(result.error);
            return;
        }

        router.push(result?.url || "/dashboard");
        router.refresh();
    };

    const handleGoogleClick = () => {
        toast.message("Google sign-in is not configured yet.");
    };

    return (
        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 md:p-10 shadow-lg relative mx-auto my-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Back to Home - Absolute top left inside card */}
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-3 h-3" />
                Back to Home
            </Link>

            <div className="flex flex-col items-center mt-6">
                <Image
                    src="/logo.png"
                    alt="Alora Logo"
                    width={70}
                    height={70}
                    className="object-contain mb-6"
                />
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back</h1>
                <p className="text-sm font-medium text-gray-500 mb-8">
                    Sign in to your Alora account
                </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Email Address</label>
                    <input
                        type="email"
                        placeholder="you@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 bg-[#E6F0F4] border border-transparent focus:border-[#8BCCE6] rounded-xl px-4 text-sm outline-none transition-colors text-gray-800 placeholder:text-gray-400 font-medium"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-12 bg-[#E6F0F4] border border-transparent focus:border-[#8BCCE6] rounded-xl px-4 pr-12 text-sm flex items-center tracking-widest outline-none transition-colors text-gray-800 placeholder:text-gray-400 font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleCredentialSignIn}
                        className="w-full h-12 rounded-xl text-white font-semibold text-[15px] shadow-sm hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign In"}
                    </button>
                </div>

                <div className="pt-1">
                    <button
                        type="button"
                        onClick={handleGoogleClick}
                        className="w-full h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-[15px] hover:bg-gray-50 transition-colors"
                    >
                        Sign in with Google
                    </button>
                </div>

                <div className="py-2 text-center">
                    <span className="text-xs text-gray-400 font-medium">Don&apos;t have an account?</span>
                </div>

                <Link
                    href="/sign-up"
                    className="w-full h-12 rounded-xl bg-[#FFF6F4] text-[#E8825A] flex items-center justify-center font-semibold text-[15px] hover:bg-[#FCECE8] transition-colors"
                >
                    Sign Up
                </Link>

                <button
                    type="button"
                    onClick={handleGoogleClick}
                    className="w-full h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-[15px] hover:bg-gray-50 transition-colors"
                >
                    Sign up with Google
                </button>

            </form>
        </div>
    );
}

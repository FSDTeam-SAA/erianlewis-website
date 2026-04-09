"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get("email") || "");
        if (params.get("registered") === "1") {
            toast.success("Account created successfully. Please sign in.");
        }
        if (params.get("emailUpdated") === "1") {
            toast.success("Email updated successfully. Please sign in with your new email.");
        }
        if (params.get("deleted") === "1") {
            toast.success("Your account has been deleted.");
        }
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
            callbackUrl,
        });
        setLoading(false);

        if (result?.error) {
            toast.error(result.error);
            return;
        }

        router.push(result?.url || callbackUrl);
        router.refresh();
    };

    return (
        <div className="auth-card mx-auto my-auto w-full max-w-[520px] p-8 md:p-10">
            <div className="mb-8 flex flex-col items-center">
                <Image
                    src="/logo.png"
                    alt="Alora Logo"
                    width={70}
                    height={70}
                    className="mb-6 object-contain"
                />
                <h1 className="auth-title mb-3">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your Alora account</p>
            </div>

            <form
                className="space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCredentialSignIn();
                }}
            >
                <div className="space-y-1.5">
                    <label className="auth-label">Email Address</label>
                    <input
                        type="email"
                        placeholder="you@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="auth-label">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6368] transition-colors hover:text-[#202124]"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-button-primary w-full"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                    </button>
                </div>

                <div className="pt-1">
                    <div className="mb-3 text-right">
                        <Link
                            href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                            className="text-sm font-medium text-[#5f6368] underline underline-offset-2 hover:text-[#202124]"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <div className="py-2 text-center">
                    <span className="text-sm text-[#7b8595]">Don&apos;t have an account?</span>
                </div>

                <Link
                    href="/sign-up"
                    className="auth-button-primary w-full"
                >
                    Sign Up
                </Link>
            </form>
        </div>
    );
}

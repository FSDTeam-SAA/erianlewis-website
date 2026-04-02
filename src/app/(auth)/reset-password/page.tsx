"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get("email") || "");
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email || !newPassword || !confirmPassword) {
            toast.error("Please complete all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", { email, newPassword });
            toast.success("Password reset successfully. Please sign in.");
            router.push(`/sign-in?email=${encodeURIComponent(email)}`);
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
                    : "Failed to reset password.";

            toast.error(message);
        } finally {
            setLoading(false);
        }
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
                <h1 className="auth-title mb-3">Reset Password</h1>
                <p className="auth-subtitle text-center">
                    Set a new password for {email || "your account"}.
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                    <label className="auth-label">New Password</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="auth-input pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6368] transition-colors hover:text-[#202124]"
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="auth-label">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="auth-input pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5f6368] transition-colors hover:text-[#202124]"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-button-primary w-full"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
                </button>

                <div className="text-center">
                    <Link
                        href="/sign-in"
                        className="text-sm font-medium text-[#5f6368] underline underline-offset-2 hover:text-[#202124]"
                    >
                        Back to sign in
                    </Link>
                </div>
            </form>
        </div>
    );
}

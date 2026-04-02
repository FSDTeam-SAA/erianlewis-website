"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEmail(params.get("email") || "");
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/forget-password", { email });
            toast.success("Verification code sent to your email.");
            router.push(`/verify-otp?mode=reset&email=${encodeURIComponent(email)}`);
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
                    : "Failed to send verification code.";

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
                <h1 className="auth-title mb-3">Forgot Password</h1>
                <p className="auth-subtitle text-center">
                    Enter your email and we&apos;ll send a 6 digit verification code.
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
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

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-button-primary w-full"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Code"}
                </button>
            </form>
        </div>
    );
}

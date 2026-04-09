"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

interface ContactLandlordFormProps {
    onScheduleClick: () => void;
    propertyId: string;
    ownerEmail?: string;
    ownerPhone?: string;
    propertyTitle?: string;
}

export function ContactLandlordForm({ onScheduleClick, propertyId, ownerEmail, ownerPhone, propertyTitle }: ContactLandlordFormProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        message: "I am interested in this property...",
    });

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            fullName: session?.user?.name || prev.fullName,
            email: session?.user?.email || prev.email,
        }));
    }, [session?.user?.email, session?.user?.name]);

    const redirectToSignIn = () => {
        toast.error("Please sign in to continue");
        const callbackUrl = pathname || "/";
        router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!session?.user) {
            redirectToSignIn();
            return;
        }

        if (!formData.fullName || !formData.email || !formData.message) {
            toast.error("Please complete the required fields");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inquiries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    propertyId,
                    ...formData,
                }),
            });

            const payload = await response.json();
            if (!response.ok || !payload?.status) {
                throw new Error(payload?.message || "Failed to send inquiry");
            }

            toast.success("Inquiry sent successfully");
            setFormData((prev) => ({
                ...prev,
                phone: "",
                message: `I am interested in ${propertyTitle || "this property"}...`,
            }));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send inquiry");
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => {
        if (!session?.user) {
            redirectToSignIn();
            return;
        }

        if (!ownerPhone) {
            toast.error("Owner phone number is not available");
            return;
        }

        const normalized = ownerPhone.replace(/[^\d+]/g, "");
        window.open(`https://wa.me/${normalized}`, "_blank", "noopener,noreferrer");
    };

    const handleScheduleViewing = () => {
        if (!session?.user) {
            redirectToSignIn();
            return;
        }

        onScheduleClick();
    };

    return (
        <div className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-white sticky top-6">
            <h3 className="text-lg font-extrabold text-gray-900 mb-5">Contact Landlord</h3>

            <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Full Name*</label>
                <input
                    value={formData.fullName}
                    onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))}
                    placeholder="John Doe"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium text-gray-800 mb-4 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                />

                {/* Email */}
                <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Email*</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="john@example.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium text-gray-800 mb-4 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                />

                {/* Phone */}
                <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Phone</label>
                <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.phone}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, "") }))}
                    placeholder="5551234567"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium text-gray-800 mb-4 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                />

                {/* Message */}
                <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Message*</label>
                <textarea
                    value={formData.message}
                    onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                    placeholder="I am interested in this property..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-800 mb-5 outline-none resize-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                />

                {/* Request Information - gradient button */}
                <button
                    type="submit"
                    style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                    className="w-full text-white py-3.5 rounded-xl text-[15px] font-bold mb-4 shadow-md hover:opacity-90 transition-opacity tracking-wide"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Request Information"}
                </button>
            </form>

            {/* Call + Email buttons */}
            <div className="flex gap-3 mb-4">
                <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Phone size={16} className="text-gray-500" /> WhatsApp
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (!session?.user) {
                            redirectToSignIn();
                            return;
                        }

                        if (!ownerEmail) {
                            toast.error("Owner email is not available");
                            return;
                        }
                        window.location.href = `mailto:${ownerEmail}`;
                    }}
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <Mail size={16} className="text-gray-500" /> Email
                </button>
            </div>

            {/* Schedule Viewing - orange gradient */}
            <button
                type="button"
                onClick={handleScheduleViewing}
                style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                className="w-full text-white py-3.5 rounded-xl text-[15px] font-bold shadow-md hover:opacity-90 transition-opacity tracking-wide"
            >
                Schedule Viewing
            </button>
        </div>
    );
}

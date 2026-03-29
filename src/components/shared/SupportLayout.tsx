"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, ScrollText, ShieldCheck } from "lucide-react";
import { ListingNavbar } from "@/components/shared/ListingNavbar";
import { Footer } from "@/components/shared/Footer";

interface SupportLayoutProps {
    children: React.ReactNode;
    activeTab: 'contact' | 'terms' | 'privacy';
}

export function SupportLayout({ children, activeTab }: SupportLayoutProps) {
    const router = useRouter();

    let title = "Contact Support";
    if (activeTab === "terms") title = "Terms of Service";
    if (activeTab === "privacy") title = "Privacy and Policy";

    return (
        <main className="min-h-screen bg-gray-100 font-sans flex flex-col">
            <ListingNavbar />

            <div className="flex-1 w-full pb-16">
                {/* Top breadcrumb */}
                <div className="px-6 py-4 max-w-5xl mx-auto w-full">
                    <span className="text-[13px] font-bold text-gray-500 tracking-wider uppercase">{title}</span>
                </div>

                {/* Main white card */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 mt-2 mb-10 border border-gray-100">

                    {/* Page title */}
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight">{title}</h1>
                            <p className="text-[13px] font-bold text-gray-400 mt-1">Effective 1/8/2026</p>
                        </div>
                        <button
                            onClick={() => router.push('/account')}
                            className="flex items-center gap-1.5 px-4 py-2 text-[14px] font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                            <ArrowLeft size={16} /> Back Settings
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-2.5 mb-8 border-b border-gray-100 pb-5">
                        <Link href="/support/contact">
                            <button
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all shadow-sm
                  ${activeTab === 'contact' ? 'text-white' : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-200'}`}
                                style={activeTab === 'contact' ? { background: 'linear-gradient(102.89deg, #80BDEA 0%, #FF7D51 100%)', border: 'none' } : {}}>
                                <Mail size={16} /> Contact Support
                            </button>
                        </Link>

                        <Link href="/support/terms">
                            <button
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all shadow-sm
                  ${activeTab === 'terms' ? 'text-white' : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-200'}`}
                                style={activeTab === 'terms' ? { background: 'linear-gradient(102.89deg, #80BDEA 0%, #FF7D51 100%)', border: 'none' } : {}}>
                                <ScrollText size={16} /> Terms of Service
                            </button>
                        </Link>

                        <Link href="/support/privacy">
                            <button
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all shadow-sm
                  ${activeTab === 'privacy' ? 'text-white' : 'text-gray-600 bg-white hover:bg-gray-50 border border-gray-200'}`}
                                style={activeTab === 'privacy' ? { background: 'linear-gradient(102.89deg, #80BDEA 0%, #FF7D51 100%)', border: 'none' } : {}}>
                                <ShieldCheck size={16} /> Privacy and Policy
                            </button>
                        </Link>
                    </div>

                    {/* Page content renders here */}
                    <div>{children}</div>

                </div>
            </div>

            <Footer />
        </main>
    );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="auth-shell flex flex-col">
            <div className="relative z-10 flex-1 flex flex-col">
                <div className="px-4 pt-6 md:px-6 md:pt-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#5f6368] transition-colors hover:text-[#202124]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </div>
                <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 md:px-6 md:py-16">
                    {children}
                </main>
            </div>
        </div>
    );
}

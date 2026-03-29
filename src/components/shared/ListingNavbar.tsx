"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { ChevronLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function ListingNavbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const isRentals = pathname?.includes("/rentals");
    const isBuy = pathname?.includes("/buy");

    return (
        <nav className="bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-50 shadow-sm w-full">
            <div className="container mx-auto flex items-center justify-between w-full max-w-7xl">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors">
                        <ChevronLeft size={20} />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                        <Image src="/logo.png" alt="Alora Logo" width={110} height={30} className="object-contain invert brightness-0" />
                    </Link>
                </div>

                <div className="flex items-center justify-center gap-8 flex-1 mr-12 hidden md:flex">
                    <Link
                        href="/rentals"
                        className={`text-sm tracking-wide ${isRentals ? "text-orange-500 font-bold" : "text-gray-600 hover:text-black font-medium"}`}
                    >
                        Rentals
                    </Link>
                    <Link
                        href="/buy"
                        className={`text-sm tracking-wide ${isBuy ? "text-orange-500 font-bold" : "text-gray-600 hover:text-black font-medium"}`}
                    >
                        Buy
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-5 text-sm hidden lg:flex">
                            <span className="text-gray-500">Signed in <span className="font-semibold text-gray-900">{session.user?.name || "Rifat Hossain"}</span></span>
                            <button className="flex items-center gap-1 text-gray-600 hover:text-black font-medium transition-colors">
                                USD($) <span className="text-[10px]">▼</span>
                            </button>
                            <Link href="/saved" className="text-gray-600 hover:text-black font-medium transition-colors">Saved Searches</Link>
                            <Link href="/account" className="text-gray-600 hover:text-black font-medium transition-colors">My Account</Link>
                            <button className="text-gray-600 hover:text-black font-medium transition-colors">Sign out</button>
                        </div>
                    ) : (
                        <button className="border border-gray-300 text-gray-700 rounded px-5 py-1.5 text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

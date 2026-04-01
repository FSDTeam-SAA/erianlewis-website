"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Bookmark } from "lucide-react";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center pointer-events-auto">
                <Link href="/">
                    <Image
                        src="/logo.png"
                        alt="Alora Logo"
                        width={150}
                        height={40}
                        priority
                        className="object-contain"
                    />
                </Link>
            </div>
            <div className="flex items-center gap-8 pointer-events-auto hidden md:flex">
                <Link href="/rentals" className="text-[#000000] text-[15px] font-[500] leading-[1.2] hover:opacity-80 transition-opacity">Rentals</Link>
                <Link href="/buy" className="text-[#000000] text-[15px] font-[500] leading-[1.2] hover:opacity-80 transition-opacity">Buy</Link>
                <Link href="/list-property" className="text-[#000000] text-[15px] font-[500] leading-[1.2] hover:opacity-80 transition-opacity">List Your Property</Link>

                {session ? (
                    <div className="flex items-center gap-6 ml-4">
                        <Link href="/saved" className="flex items-center gap-2 text-[#000000] text-[15px] font-[500] hover:opacity-80 transition-opacity">
                            <Bookmark className="w-4 h-4" />
                            Saved Searches
                        </Link>
                        <div className="flex flex-col text-right -space-y-1">
                            <span className="text-[11px] text-gray-500 font-medium">Signed in</span>
                            <span className="text-[14px] font-[600] text-gray-900">{session.user?.name || "Rifat Hossain"}</span>
                        </div>
                        <Link href="/dashboard" className="px-5 py-2.5 bg-white text-gray-800 rounded-lg text-[14px] font-bold shadow-sm hover:shadow transition-shadow border border-gray-100">
                            Dashboard
                        </Link>
                        <Link href="/account" className="px-5 py-2.5 bg-white text-gray-800 rounded-lg text-[14px] font-bold shadow-sm hover:shadow transition-shadow border border-gray-100">
                            My Account
                        </Link>
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: "/sign-in" })}
                            className="px-5 py-2.5 bg-white text-gray-800 rounded-lg text-[14px] font-bold shadow-sm hover:shadow transition-shadow border border-gray-100"
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/sign-in"
                        className="px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-transform hover:-translate-y-0.5 shadow-md ml-4"
                        style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                    >
                        Sign In
                    </Link>
                )}
            </div>

            <div className="md:hidden pointer-events-auto">
                <Link
                    href="/sign-in"
                    className="px-4 py-2 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm shadow-md"
                    style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                >
                    Sign In
                </Link>
            </div>
        </nav>
    );
}

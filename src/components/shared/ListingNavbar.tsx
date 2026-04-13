"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Bookmark, ChevronLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { LogoutConfirmDialog } from "@/components/shared/LogoutConfirmDialog";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { useCurrencyPreference } from "@/lib/hooks/useCurrencyPreference";

export function ListingNavbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const { selectedCurrency, setSelectedCurrency } = useCurrencyPreference();
    const ownerCtaHref = session
        ? "/list-property"
        : `/sign-in?callbackUrl=${encodeURIComponent("/list-property")}`;

    const isRentals = pathname?.includes("/rentals");
    const isBuy = pathname?.includes("/buy");

    const isActiveRoute = (href: string) =>
        pathname === href || pathname?.startsWith(`${href}/`);

    const getNavLinkClassName = (href: string, isPrimary = false) =>
        `text-[15px] transition-colors ${
            isActiveRoute(href) || isPrimary
                ? "text-[#f6855c] font-bold"
                : "text-gray-600 hover:text-black font-medium"
        }`;

    const handleLogout = async () => {
        try {
            setLogoutDialogOpen(false);
            toast.success("Logout successful!");
            await signOut({ callbackUrl: "/" });
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed. Please try again.");
        }
    };

    return (
        <nav className="bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-50 shadow-sm w-full">
            <div className="container mx-auto flex items-center justify-between w-full max-w-7xl">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors">
                        <ChevronLeft size={20} />
                        <span className="text-[15px] font-medium">Back</span>
                    </button>
                    <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                        <Image src="/logo.png" alt="Alora Logo" width={110} height={30} className="object-contain invert brightness-0" />
                    </Link>
                </div>

                <div className="flex items-center gap-5 md:gap-7">
                    {session ? (
                        <div className="hidden items-center gap-5 lg:flex">
                            <Link
                                href="/rentals"
                                className={`${getNavLinkClassName("/rentals", isRentals)} tracking-wide`}
                            >
                                Rentals
                            </Link>
                            <Link
                                href="/buy"
                                className={`${getNavLinkClassName("/buy", isBuy)} tracking-wide`}
                            >
                                Buy
                            </Link>
                            <Link
                                href={ownerCtaHref}
                                className={getNavLinkClassName("/list-property")}
                            >
                                List Your Property
                            </Link>
                            <Link
                                href="/saved"
                                className={`inline-flex items-center gap-2 ${getNavLinkClassName("/saved")}`}
                            >
                                <Bookmark className="h-4 w-4" />
                                Saved Searches
                            </Link>
                            <span className="text-[15px] text-gray-500">Signed in <span className="font-semibold text-gray-900">{session.user?.name || "Rifat Hossain"}</span></span>
                            <CurrencySelector
                                value={selectedCurrency}
                                onChange={setSelectedCurrency}
                                buttonClassName="border-none px-0 py-0 text-[15px] text-gray-600 shadow-none hover:bg-transparent hover:text-black"
                                contentClassName="w-[300px]"
                            />
                            <Link href="/account" className={getNavLinkClassName("/account")}>My Account</Link>
                            <button
                                type="button"
                                onClick={() => setLogoutDialogOpen(true)}
                                className="text-[15px] text-gray-600 hover:text-black font-medium transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/sign-in"
                            className="border border-gray-300 text-gray-700 rounded px-5 py-1.5 text-[15px] font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Sign In
                        </Link>
                    )}
                    {!session ? (
                        <div className="hidden items-center gap-7 lg:flex">
                            <Link
                                href="/rentals"
                                className={`${getNavLinkClassName("/rentals", isRentals)} tracking-wide`}
                            >
                                Rentals
                            </Link>
                            <Link
                                href="/buy"
                                className={`${getNavLinkClassName("/buy", isBuy)} tracking-wide`}
                            >
                                Buy
                            </Link>
                            <Link
                                href={ownerCtaHref}
                                className={getNavLinkClassName("/list-property")}
                            >
                                List Your Property
                            </Link>
                        </div>
                    ) : null}
                </div>
            </div>

            <LogoutConfirmDialog
                open={logoutDialogOpen}
                onOpenChange={setLogoutDialogOpen}
                onConfirm={handleLogout}
            />
        </nav>
    );
}

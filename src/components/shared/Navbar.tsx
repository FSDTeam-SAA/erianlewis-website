import Link from "next/link";
import Image from "next/image";

export function Navbar() {
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center pointer-events-auto">
                <Image
                    src="/logo.png"
                    alt="Alora Logo"
                    width={150}
                    height={40}
                    priority
                    className="object-contain"
                />
            </div>
            <div className="flex items-center gap-8 pointer-events-auto hidden md:flex">
                <Link href="/rentals" className="text-[#000000] text-[18px] font-[500] leading-[1.2] hover:opacity-80 transition-opacity">Rentals</Link>
                <Link href="/buy" className="text-[#000000] text-[18px] font-[500] leading-[1.2] hover:opacity-80 transition-opacity">Buy</Link>
                <button
                    className="px-6 py-3 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity border-none shadow-md"
                    style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                >
                    Sign In
                </button>
            </div>
            <div className="md:hidden pointer-events-auto">
                <button
                    className="px-4 py-2 text-white rounded-[10px] font-semibold hover:opacity-90 transition-opacity text-sm shadow-md"
                    style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                >
                    Sign In
                </button>
            </div>
        </nav>
    );
}

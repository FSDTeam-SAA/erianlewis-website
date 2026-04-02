import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-footer text-white pt-16 pb-8 px-6 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center w-max">
            <Image
              src="/footer-logo.png"
              alt="Alora Logo"
              width={53}
              height={52}
              className="object-contain"
            />
          </div>
          <p className="text-gray-400 text-sm max-w-[200px] leading-relaxed">
            Luxury Caribbean real estate at your fingertips
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-lg">Explore</h4>
          <div className="flex flex-col gap-3">
            <Link
              href="/rentals"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Rentals
            </Link>
            <Link
              href="/sales"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Sales
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-lg">For Landlords</h4>
          <div className="flex flex-col gap-3">
            <Link
              href="/list-property"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              List Property
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-lg">Company</h4>
          <div className="flex flex-col gap-3">
            <Link
              href="/contact"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
        © 2025 Alora. All rights reserved.
      </div>

      <button
        className="fixed bottom-6 right-6 text-white px-6 py-3.5 rounded-full font-semibold shadow-xl hover:opacity-90 transition-transform hover:-translate-y-1 z-50 text-sm"
        style={{
          background:
            'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
        }}
      >
        List Your Property
      </button>
    </footer>
  )
}

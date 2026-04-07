'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

export function Footer() {
  const { data: session } = useSession()
  const currentYear = new Date().getFullYear()
  const ownerCtaHref = session
    ? '/list-property'
    : `/sign-in?callbackUrl=${encodeURIComponent('/list-property')}`

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
            Luxury real estate at your fingertips with Alora
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
              href="/buy"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Buy
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-semibold text-lg">For Landlords</h4>
          <div className="flex flex-col gap-3">
            <Link
              href={ownerCtaHref}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              List Property
            </Link>
            <Link
              href={session ? '/dashboard' : '/sign-in?callbackUrl=%2Fdashboard'}
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
              href="/support/contact"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Contact
            </Link>
            <Link
              href="/support/privacy"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/support/terms"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
        © {currentYear} Alora. All rights reserved.
      </div>

      <Link
        href={ownerCtaHref}
        className="fixed bottom-6 right-6 text-white px-6 py-3.5 rounded-full font-semibold shadow-xl hover:opacity-90 transition-transform hover:-translate-y-1 z-50 text-sm"
        style={{
          background:
            'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
        }}
      >
        List Your Property
      </Link>
    </footer>
  )
}

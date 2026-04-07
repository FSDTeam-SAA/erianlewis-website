'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import {
  Bookmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UserCircle2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { UserProfileApiResponse } from '@/app/(tenant)/account/_components/user-data-type'
import { LogoutConfirmDialog } from '@/components/shared/LogoutConfirmDialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navLinks = [
  { href: '/rentals', label: 'Rentals' },
  { href: '/buy', label: 'Buy' },
]

const ownerNavLink = { href: '/list-property', label: 'List Your Property' }

const signedInLinks = [
  { href: '/account', label: 'My Account', icon: UserCircle2 },
  { href: '/favorites', label: 'My Favorites', icon: Bookmark },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

export function Navbar({ variant = 'overlay' }: { variant?: 'overlay' | 'solid' }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const token = session?.user?.accessToken
  const ownerCtaHref = token
    ? ownerNavLink.href
    : `/sign-in?callbackUrl=${encodeURIComponent(ownerNavLink.href)}`

  const { data: profile } = useQuery<UserProfileApiResponse>({
    queryKey: ['navbar-profile'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to load user profile')
      }

      return response.json()
    },
    enabled: Boolean(token),
  })

  const displayName = profile?.data?.firstName
    ? `${profile.data.firstName} ${profile.data.lastName ?? ''}`.trim()
    : session?.user?.name || 'Guest'

  const profileImage =
    profile?.data?.profileImage || '/assets/images/no-user.jpg'

  const handleLogout = async () => {
    try {
      setMobileMenuOpen(false)
      setMenuOpen(false)
      setLogoutDialogOpen(false)
      toast.success('Logout successful!')
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed. Please try again.')
    }
  }

  const isActiveRoute = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`)

  const getNavLinkClassName = (href: string) =>
    `text-[15px] font-medium leading-[1.2] transition-colors ${
      isActiveRoute(href)
        ? 'text-[#f6855c]'
        : 'text-[#111827] hover:text-[#f6855c]'
    }`

  const getMobileNavLinkClassName = (href: string) =>
    `block rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
      isActiveRoute(href)
        ? 'bg-[#fff5f4] text-[#f6855c]'
        : 'text-[#111827] hover:bg-[#f8fafc]'
    }`

  return (
    <nav
      className={
        variant === 'solid'
          ? 'sticky inset-x-0 top-0 z-50 border-b border-[#eceef2] bg-white/95 backdrop-blur'
          : 'absolute inset-x-0 top-0 z-50'
      }
    >
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="Alora Logo"
              width={150}
              height={40}
              priority
              className="h-[100px] object-contain"
            />
          </Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <div className="hidden items-center gap-7 xl:flex">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={getNavLinkClassName(link.href)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ownerCtaHref}
              className={getNavLinkClassName(ownerNavLink.href)}
            >
              {ownerNavLink.label}
            </Link>
          </div>

          {token ? (
            <>
              <Link
                href="/saved"
                className={`inline-flex items-center gap-2 text-[15px] font-medium transition-colors ${
                  isActiveRoute('/saved')
                    ? 'text-[#f6855c]'
                    : 'text-[#111827] hover:text-[#f6855c]'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                Saved Searches
              </Link>

              <DropdownMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                modal={false}
              >
                <DropdownMenuTrigger className="outline-none">
                  <Image
                    src={profileImage}
                    alt="User profile"
                    width={56}
                    height={56}
                    className="h-12 w-12 rounded-full border border-white/70 object-cover shadow-[0_10px_25px_rgba(15,23,42,0.14)]"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl border border-[#eceef2] bg-white p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
                >
                  <div className="rounded-xl bg-[#f8fafc] px-3 py-3">
                    <p className="text-[11px] font-medium text-[#6b7280]">
                      Signed in as
                    </p>
                    <p className="truncate text-sm font-semibold text-[#111827]">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-[#8b95a7]">
                      {profile?.data?.email || session?.user?.email || ''}
                    </p>
                  </div>

                  {signedInLinks.map(item => {
                    const Icon = item.icon

                    return (
                      <DropdownMenuItem
                        key={item.href}
                        className="mt-1 rounded-xl px-3 py-2 text-[#131313]"
                      >
                        <Link
                          href={item.href}
                          className={`flex w-full items-center gap-2.5 text-sm font-medium ${
                            isActiveRoute(item.href)
                              ? 'text-[#f6855c]'
                              : 'text-[#131313]'
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              isActiveRoute(item.href)
                                ? 'text-[#f6855c]'
                                : 'text-[#6b7280]'
                            }`}
                          />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}

                  <DropdownMenuItem
                    variant="destructive"
                    className="mt-1 rounded-xl px-3 py-2 text-sm font-medium"
                    onClick={() => setLogoutDialogOpen(true)}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-xl px-6 py-3 font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:opacity-90"
                style={{
                  background:
                    'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                }}
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="border-white/70 bg-white/90 md:hidden"
          onClick={() => setMobileMenuOpen(current => !current)}
          aria-label={
            mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
        >
          {mobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {mobileMenuOpen ? (
        <div
          className={`mx-4 rounded-3xl p-4 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur md:hidden ${
            variant === 'solid'
              ? 'border border-[#eceef2] bg-white'
              : 'border border-white/70 bg-white/95'
          }`}
        >
          <div className="space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={getMobileNavLinkClassName(link.href)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ownerCtaHref}
              className={getMobileNavLinkClassName(ownerNavLink.href)}
              onClick={() => setMobileMenuOpen(false)}
            >
              {ownerNavLink.label}
            </Link>
          </div>

          <div className="my-4 h-px bg-[#eceef2]" />

          {token ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] px-3 py-3">
                <Image
                  src={profileImage}
                  alt="User profile"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#111827]">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-[#6b7280]">
                    {profile?.data?.email || session?.user?.email || ''}
                  </p>
                </div>
              </div>

              {signedInLinks.map(item => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActiveRoute(item.href)
                        ? 'bg-[#fff5f4] text-[#f6855c]'
                        : 'text-[#111827] hover:bg-[#f8fafc]'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActiveRoute(item.href)
                          ? 'text-[#f6855c]'
                          : 'text-[#6b7280]'
                      }`}
                    />
                    {item.label}
                  </Link>
                )
              })}

              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left text-sm font-medium text-[#b42318] transition-colors hover:bg-[#fff5f4]"
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/sign-in"
                className="block rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-sm"
                style={{
                  background:
                    'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>

              <Link
                href="/buy"
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#e5e7eb] px-4 py-3 text-sm font-medium text-[#111827]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                Explore Properties
              </Link>
            </div>
          )}
        </div>
      ) : null}

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
      />
    </nav>
  )
}

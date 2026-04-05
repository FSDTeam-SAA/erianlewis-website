'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function DashboardNotFound() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    const timer = setTimeout(() => setIsLoaded(true), 100)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0d5c8] via-[#d9e8f0] to-[#c8dff0] px-4 font-sans">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/40 bg-white/10 backdrop-blur-sm shadow-sm"
            style={{
              width: `${(i + 1) * 120}px`,
              height: `${(i + 1) * 120}px`,
              left: `calc(50% - ${(i + 1) * 60}px)`,
              top: `calc(50% - ${(i + 1) * 60}px)`,
              animationDuration: `${20 + i * 5}s`,
              animationDelay: `${i * 0.2}s`,
              animation: `pulse ${10 + i * 2}s infinite ease-in-out alternate`,
              transform: `
                translate(
                  ${mousePosition.x * (i + 1) * 15}px,
                  ${mousePosition.y * (i + 1) * 15}px
                )
              `,
              transition: 'transform 0.2s ease-out',
            }}
          />
        ))}
      </div>

      <div
        className={`z-10 flex flex-col items-center text-center transition-all duration-1000 ease-out bg-white/60 backdrop-blur-md p-10 md:p-16 rounded-[2rem] shadow-xl border border-white/50 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-6 border border-[#E8825A]/20">
          <LayoutDashboard className="w-10 h-10 text-[#E8825A]" />
        </div>

        <div
          className="relative mb-4"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          <h1
            className="text-[6rem] sm:text-[8rem] md:text-[10rem] font-black leading-none tracking-tighter text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
          >
            404
          </h1>
        </div>

        <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
          Dashboard page not found
        </h2>

        <p className="mb-10 max-w-md text-gray-600 font-medium">
          The dashboard page you&apos;re looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
        </p>

        <div className="flex w-full flex-col items-stretch gap-4 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/dashboard"
            className="group relative inline-flex h-14 w-full shrink-0 items-center justify-center overflow-hidden rounded-full border-none px-8 text-base font-bold text-white shadow-md transition-all hover:shadow-lg sm:w-auto"
            style={{
              background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)',
              transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`,
              transition: 'transform 0.3s ease-out, box-shadow 0.3s ease',
            }}
          >
            Back to dashboard
          </Link>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="group relative flex h-14 w-full shrink-0 items-center justify-center overflow-hidden rounded-full border-gray-200 bg-white/80 px-8 text-base font-bold text-gray-800 shadow-sm transition-all hover:bg-gray-50 hover:shadow sm:w-auto"
            style={{
              transform: `translate(${mousePosition.x * -5}px, ${mousePosition.y * -5}px)`,
              transition:
                'transform 0.3s ease-out, background-color 0.3s ease, border-color 0.3s ease',
            }}
          >
            <ArrowLeft className="mr-2 h-5 w-5 text-gray-500 group-hover:-translate-x-1 transition-transform" />
            <span>Go back</span>
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.05) rotate(5deg);
          }
        }
      `}</style>
    </div>
  )
}

"use client"

import Image from "next/image"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Heart, MapPin, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { ApiSuccessResponse } from "@/app/(tenant)/account/_components/user-data-type"
import { formatConvertedPrice } from "@/lib/currency"
import { useCurrencyPreference } from "@/lib/hooks/useCurrencyPreference"
import { FavoritesApiResponse } from "./favorite-data-type"

const getPropertyLocation = (cityTown: string, island: string | null, streetNumber: string) => {
  return [streetNumber, cityTown, island].filter(Boolean).join(", ")
}

const getPropertyDetailsHref = (listingType: string, propertyId: string) => {
  return listingType === "buy" ? `/buy/${propertyId}` : `/rentals/${propertyId}`
}

const FALLBACK_PROPERTY_IMAGE = "/assets/images/no-user.jpeg"

const FavoritesContainer = () => {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const token = session?.user?.accessToken
  const { selectedCurrency, rates } = useCurrencyPreference()

  const { data, isLoading } = useQuery<FavoritesApiResponse>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load favorites")
      }

      return response.json()
    },
    enabled: Boolean(token),
  })

  const favorites = data?.data ?? []

  const { mutate: removeFavorite, isPending: isRemovingFavorite } = useMutation({
    mutationFn: async (favoriteId: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites/${favoriteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result: ApiSuccessResponse = await response.json()

      if (!response.ok || !result.status) {
        throw new Error(result.message || "Failed to remove favorite")
      }

      return result
    },
    onSuccess: async result => {
      toast.success(result.message || "Favorite removed successfully")
      await queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : "Failed to remove favorite")
    },
  })

  return (
    <main className="min-h-screen bg-[#f6f7f9]">
      <div className="w-full border-b border-[#e9edf2] bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-normal text-black">My Favorites</h1>
            <p className="mt-1 text-sm md:text-base font-normal leading-normal text-[#262626]">
              {favorites.length} Saved {favorites.length === 1 ? "Property" : "Properties"}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-black leading-normal transition-colors hover:text-[#111827]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[18px] border border-[#eceef2] bg-white">
                <div className="h-44 animate-pulse bg-[#eef2f6]" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#eef2f6]" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-[#eef2f6]" />
                  <div className="h-7 w-1/2 animate-pulse rounded bg-[#eef2f6]" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[20px] border border-[#eceef2] bg-white px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#dbe1e8] bg-[#fbfcfd]">
              <Heart className="h-7 w-7 text-[#344054]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#344054]">No favorites yet</h2>
            <p className="mt-2 max-w-md text-sm text-[#667085]">
              Start exploring properties and save your favorites to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {favorites?.map(item => {
              const property = item.property
              const image = property?.photos?.[0]?.url || FALLBACK_PROPERTY_IMAGE
              const title = property?.basicInformation?.propertyTitle || "Property"
              const location = getPropertyLocation(
                property?.address?.cityTown || "",
                property?.address?.island || null,
                property?.address?.streetNumber || ""
              )
              const price = formatConvertedPrice(
                property?.basicInformation?.monthlyRent || 0,
                property?.basicInformation?.preferredCurrency,
                selectedCurrency,
                rates,
              )
              const badgeLabel = property?.listingType === "rent" ? "For rent" : "For sale"
              const priceLabel = property?.listingType === "rent" ? `Starting from ${price}/month` : price
              const propertyId = property?._id || item._id
              const propertyHref = getPropertyDetailsHref(property?.listingType || "rent", propertyId)

              return (
                <article
                  key={item._id}
                  className="group relative overflow-hidden rounded-[18px] border border-[#eceef2] bg-white shadow-[0_6px_22px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
                >
                  <div className="relative h-48">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />

                    <div className="absolute left-3 top-3 rounded-full bg-[#d98d62] px-3 py-1 text-[11px] font-semibold text-white">
                      {badgeLabel}
                    </div>

                    <button
                      type="button"
                      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#f04438] shadow-sm transition-colors hover:bg-[#fff1f0] disabled:cursor-not-allowed disabled:opacity-60 "
                      aria-label="Remove favorite"
                      disabled={isRemovingFavorite}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        removeFavorite(item?.property?._id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <h2 className="line-clamp-1 text-[15px] font-semibold text-[#111827] transition-colors group-hover:text-[#d98d62]">
                        {title}
                      </h2>

                      <div className="mt-2 flex items-start gap-2 text-[11px] text-[#6b7280]">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-2 uppercase tracking-[0.06em]">
                          {location}
                        </span>
                      </div>
                    </div>

                    <p className="text-[15px] font-semibold text-[#111827] sm:text-[18px]">{priceLabel}</p>
                  </div>

                  <Link
                    href={propertyHref}
                    className="absolute inset-0 rounded-[18px]"
                    aria-label={`View details for ${title}`}
                  />
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default FavoritesContainer

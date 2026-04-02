"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

type ListingType = "rent" | "buy";

interface PropertyMapViewPageProps {
  listingType: ListingType;
}

interface RentalPropertyApiItem {
  _id: string;
  listingType?: ListingType;
  basicInformation?: {
    propertyTitle?: string;
    monthlyRent?: number;
    preferredCurrency?: string;
  };
  address?: {
    streetNumber?: string;
    cityTown?: string;
    island?: { _id?: string; name?: string } | string | null;
  };
  location?: {
    lat?: number | null;
    lng?: number | null;
    streetNumber?: string;
    cityTown?: string;
    island?: { _id?: string; name?: string } | string | null;
  };
  propertyDetails?: {
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    lotSizeSqFt?: number;
  };
  photos?: Array<{
    url?: string;
  }>;
}

interface PropertiesResponse {
  properties: RentalPropertyApiItem[];
  paginationInfo: {
    currentPage: number;
    totalPages: number;
    totalData: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface MapProperty {
  id: string;
  title: string;
  image: string;
  location: string;
  lat: number | null;
  lng: number | null;
  price: number;
  currency: string;
  beds: number;
  baths: number;
  areaSqft: number;
  href: string;
}

const fetchJson = async <T,>(path: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload.data as T;
};

const formatCurrencyValue = (value?: number) =>
  new Intl.NumberFormat("en-US").format(value || 0);

const buildLocationLabel = (property: RentalPropertyApiItem) => {
  const source = property.address || property.location;
  const street = source?.streetNumber;
  const city = source?.cityTown;
  const island =
    typeof source?.island === "object" ? source?.island?.name : source?.island;

  return [street, city, island].filter(Boolean).join(", ") || "Location not available";
};

const normalizeProperty = (
  property: RentalPropertyApiItem,
  listingType: ListingType,
): MapProperty => ({
  id: property._id,
  title: property.basicInformation?.propertyTitle || "Untitled property",
  image: property.photos?.[0]?.url || "/main-hero-banner.jpg",
  location: buildLocationLabel(property),
  lat: typeof property.location?.lat === "number" ? property.location.lat : null,
  lng: typeof property.location?.lng === "number" ? property.location.lng : null,
  price: property.basicInformation?.monthlyRent || 0,
  currency: property.basicInformation?.preferredCurrency || "USD",
  beds: property.propertyDetails?.bedrooms || 0,
  baths: property.propertyDetails?.bathrooms || 0,
  areaSqft:
    property.propertyDetails?.squareFeet ||
    property.propertyDetails?.lotSizeSqFt ||
    0,
  href: listingType === "buy" ? `/buy/${property._id}` : `/rentals/${property._id}`,
});

const getListRoute = (listingType: ListingType) =>
  listingType === "buy" ? "/buy" : "/rentals";

const getMapRoute = (listingType: ListingType) =>
  listingType === "buy" ? "/buy/map" : "/rentals/map";

export function PropertyMapViewPage({
  listingType,
}: PropertyMapViewPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    params.delete("page");
    params.set("limit", "100");
    params.set("listingType", listingType);
    return params.toString();
  }, [listingType, searchParams]);

  const propertiesQuery = useQuery({
    queryKey: ["map-rental-properties", listingType, queryString],
    queryFn: () => fetchJson<PropertiesResponse>(`/rental-properties?${queryString}`),
  });

  const properties = useMemo(
    () =>
      (propertiesQuery.data?.properties || []).map((property) =>
        normalizeProperty(property, listingType),
      ),
    [listingType, propertiesQuery.data?.properties],
  );

  useEffect(() => {
    const focusFromQuery = searchParams.get("focus");
    const selectedFromQuery = properties.find(
      (property) => property.id === focusFromQuery,
    );

    if (selectedFromQuery) {
      setSelectedPropertyId(selectedFromQuery.id);
      return;
    }

    if (properties.length) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, searchParams]);

  const selectedProperty =
    properties.find((property) => property.id === selectedPropertyId) ||
    properties[0];

  const propertiesWithCoordinates = useMemo(
    () =>
      properties.filter(
        (property) => property.lat != null && property.lng != null,
      ),
    [properties],
  );

  const allLocationsQuery = useMemo(() => {
    const values = properties
      .map((property) =>
        property.lat != null && property.lng != null
          ? `${property.lat},${property.lng}`
          : property.location,
      )
      .filter(Boolean)
      .slice(0, 10);

    return values.join(" OR ");
  }, [properties]);

  const mapEmbedSrc = useMemo(() => {
    if (selectedProperty?.lat != null && selectedProperty?.lng != null) {
      return `https://www.google.com/maps?q=${selectedProperty.lat},${selectedProperty.lng}&z=13&output=embed`;
    }

    if (selectedProperty?.location) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        selectedProperty.location,
      )}&z=12&output=embed`;
    }

    if (allLocationsQuery) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        allLocationsQuery,
      )}&z=10&output=embed`;
    }

    return "https://www.google.com/maps?q=Bahamas&z=9&output=embed";
  }, [allLocationsQuery, selectedProperty]);

  const googleMapsLink = useMemo(() => {
    if (selectedProperty?.lat != null && selectedProperty?.lng != null) {
      return `https://www.google.com/maps/search/?api=1&query=${selectedProperty.lat},${selectedProperty.lng}`;
    }

    if (selectedProperty?.location) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        selectedProperty.location,
      )}`;
    }

    return "https://www.google.com/maps";
  }, [selectedProperty]);

  const listPageQuery = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    params.delete("listingType");

    const serialized = params.toString();
    return serialized ? `?${serialized}` : "";
  }, [searchParams]);

  const handleFocusProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId);

    const params = new URLSearchParams(searchParams.toString());
    params.set("focus", propertyId);
    router.replace(`${getMapRoute(listingType)}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <Navbar variant="solid" />

      <div className="w-full bg-white">
        <div className="mx-auto max-w-container px-5 py-6 md:px-10 lg:px-32">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push(`${getListRoute(listingType)}${listPageQuery}`)}
                className="mb-3 inline-flex items-center gap-2 text-[14px] font-medium text-[#4b5563] transition-colors hover:text-[#111827]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to listings
              </button>
              <h1 className="text-[28px] font-bold leading-tight text-[#111827]">
                {listingType === "buy" ? "Buy" : "Rental"} Map View
              </h1>
              <p className="mt-2 text-[14px] font-normal text-[#6b7280]">
                All filtered properties are gathered here so you can browse them
                on a full-width Google Map.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-medium text-[#4b5563] shadow-sm">
                {propertiesQuery.data?.paginationInfo.totalData || properties.length}{" "}
                properties
              </div>
              <div className="rounded-full border border-[#e5e7eb] bg-white px-4 py-2 text-[13px] font-medium text-[#4b5563] shadow-sm">
                {propertiesWithCoordinates.length} with map coordinates
              </div>
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#dfe5ec] bg-white px-4 py-2 text-[13px] font-medium text-[#4b5563] shadow-sm transition-colors hover:bg-[#f9fafb]"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Google Maps
              </a>
            </div>
          </div>

          {propertiesQuery.isError ? (
            <div className="rounded-[28px] border border-[#f3c7ba] bg-white px-8 py-14 text-center shadow-sm">
              <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-[#f6855c]" />
              <h2 className="text-xl font-bold leading-normal text-black">
                Couldn&apos;t load map view
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[#6b7280]">
                {propertiesQuery.error instanceof Error
                  ? propertiesQuery.error.message
                  : "Please try again in a moment."}
              </p>
              <button
                type="button"
                onClick={() => propertiesQuery.refetch()}
                className="mx-auto mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#202124] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : propertiesQuery.isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-[58vh] w-full rounded-[32px]" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-40 w-full rounded-[28px]" />
                ))}
              </div>
            </div>
          ) : properties.length ? (
            <>
              <div className="overflow-hidden rounded-[32px] border border-[#e6e6eb] bg-white shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between border-b border-[#eef2f6] px-5 py-4 md:px-7">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#9ca3af]">
                      Google Map
                    </p>
                    <h2 className="mt-1 text-[20px] font-semibold text-[#111827]">
                      {selectedProperty?.title || "Property location"}
                    </h2>
                  </div>
                  <div className="hidden rounded-full bg-[#f8fafc] px-4 py-2 text-[13px] font-medium text-[#4b5563] md:block">
                    Focused on {selectedProperty?.location || "selected property"}
                  </div>
                </div>

                <div className="relative h-[55vh] w-full bg-[#eef2f6] md:h-[68vh]">
                  <iframe
                    title="Properties map"
                    src={mapEmbedSrc}
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-[20px] font-semibold text-[#111827]">
                      Properties on this map
                    </h3>
                    <p className="mt-1 text-[14px] font-normal text-[#6b7280]">
                      Click any property below to highlight its location on the map.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {properties.map((property) => {
                    const isSelected = property.id === selectedProperty?.id;

                    return (
                      <div
                        key={property.id}
                        onClick={() => handleFocusProperty(property.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleFocusProperty(property.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`overflow-hidden rounded-[28px] border bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                          isSelected
                            ? "border-[#f0b39e] ring-2 ring-[#f6855c]/20"
                            : "border-[#e6e6eb]"
                        }`}
                      >
                        <div className="relative h-44 w-full bg-[#eef2f6]">
                          <Image
                            src={property.image}
                            alt={property.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          <span
                            className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-md"
                            style={{
                              background:
                                "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)",
                            }}
                          >
                            {property.currency} {formatCurrencyValue(property.price)}
                            {listingType === "rent" ? "/mo" : ""}
                          </span>
                        </div>

                        <div className="space-y-3 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-[16px] font-semibold leading-normal text-black">
                                {property.title}
                              </h4>
                              <p className="mt-1 flex items-start gap-1.5 text-[13px] font-normal text-[#6b7280]">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9ca3af]" />
                                <span>{property.location}</span>
                              </p>
                            </div>
                            {property.lat != null && property.lng != null ? (
                              <span className="rounded-full bg-[#e8f5fb] px-3 py-1 text-[11px] font-medium text-[#1d8bb8]">
                                Mapped
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-[11px] font-medium text-[#94a3b8]">
                                Approximate
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#f8fafc] p-3">
                            <div className="text-[12px] font-medium text-[#6b7280]">
                              {property.beds} Beds
                            </div>
                            <div className="text-[12px] font-medium text-[#6b7280]">
                              {property.baths} Baths
                            </div>
                            <div className="text-[12px] font-medium text-[#6b7280]">
                              {property.areaSqft} sqft
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[13px] font-medium text-[#f6855c]">
                              {isSelected ? "Highlighted on map" : "Highlight on map"}
                            </span>
                            <Link
                              href={property.href}
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center rounded-full border border-[#dfe5ec] px-4 py-2 text-[12px] font-medium text-[#374151] transition-colors hover:bg-[#f9fafb]"
                            >
                              View details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-[#e6e6eb] bg-white px-8 py-14 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <h2 className="text-xl font-bold leading-normal text-black">
                No properties found
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[#6b7280]">
                We couldn&apos;t find any properties to show on the map for the
                current filters.
              </p>
              <button
                type="button"
                onClick={() => router.push(getListRoute(listingType))}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[#d1d5db] px-5 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#f9fafb]"
              >
                Back to listings
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bath,
  Bed,
  BedDouble,
  Building2,
  CarFront,
  Check,
  ExternalLink,
  MapPin,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

type ListingType = "rent" | "buy";

type GoogleMapsApi = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => {
      panTo: (position: { lat: number; lng: number }) => void;
      setCenter: (position: { lat: number; lng: number }) => void;
      setZoom: (zoom: number) => void;
      fitBounds: (bounds: { extend: (position: { lat: number; lng: number }) => void }, padding?: number) => void;
      getBounds: () => {
        contains: (position: { lat: number; lng: number }) => boolean;
      } | undefined;
    };
    Marker: new (options: Record<string, unknown>) => {
      setMap: (map: unknown) => void;
      addListener: (eventName: string, handler: () => void) => void;
    };
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    LatLngBounds: new () => {
      extend: (position: { lat: number; lng: number }) => void;
    };
    event: {
      addListener: (
        instance: unknown,
        eventName: string,
        handler: () => void,
      ) => {
        remove: () => void;
      };
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    __googleMapsLoaderPromise?: Promise<GoogleMapsApi>;
  }
}

interface PropertyMapViewPageProps {
  listingType: ListingType;
}

interface MapPinApiItem {
  _id: string;
  title?: string;
  price?: number;
  currency?: string;
  listingType?: ListingType;
  location?: {
    address?: string;
    lat?: number | null;
    lng?: number | null;
    coordinates?: {
      lat?: number | null;
      lng?: number | null;
    };
  };
  address?: {
    street?: string;
    city?: string;
    island?: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  thumbnail?: string;
}

interface MapPinsResponse {
  pins?: MapPinApiItem[];
  properties?: MapPinApiItem[];
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
  href: string;
}

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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

const getListRoute = (listingType: ListingType) =>
  listingType === "buy" ? "/buy" : "/rentals";

const getMapRoute = (listingType: ListingType) =>
  listingType === "buy" ? "/buy/map" : "/rentals/map";

const getDetailsRoute = (listingType: ListingType, id: string) =>
  listingType === "buy" ? `/buy/${id}` : `/rentals/${id}`;

const MAP_STYLES = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#dbe4ef" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7b8794" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#8ed8f8" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#d7f4dc" }],
  },
];

const createMarkerIcon = (isSelected: boolean) => {
  const width = isSelected ? 36 : 24;
  const height = isSelected ? 48 : 32;
  const badge = isSelected
    ? `<circle cx="18" cy="16" r="10" fill="#ffffff"/><circle cx="18" cy="16" r="6.5" fill="#ef1d4f"/>`
    : `<circle cx="12" cy="12" r="6" fill="#ef1d4f" stroke="#ffffff" stroke-width="2"/>`;
  const svg = isSelected
    ? `<svg width="${width}" height="${height}" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 47C25.4 37.8 31 30.4 31 21.2C31 12.8 25.2 6 18 6C10.8 6 5 12.8 5 21.2C5 30.4 10.6 37.8 18 47Z" fill="#ef1d4f"/>
        <path d="M18 46C25.4 37 30 30.2 30 21.3C30 13.6 24.8 7.5 18 7.5C11.2 7.5 6 13.6 6 21.3C6 30.2 10.6 37 18 46Z" stroke="white" stroke-width="2"/>
        ${badge}
      </svg>`
    : `<svg width="${width}" height="${height}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="#ef1d4f"/>
        <circle cx="12" cy="12" r="8" stroke="white" stroke-width="2"/>
      </svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize:
      typeof window !== "undefined" && window.google?.maps
        ? new window.google.maps.Size(width, height)
        : undefined,
    anchor:
      typeof window !== "undefined" && window.google?.maps
        ? new window.google.maps.Point(width / 2, isSelected ? height - 2 : height / 2)
        : undefined,
  };
};

const normalizeProperty = (
  property: MapPinApiItem,
  listingType: ListingType,
): MapProperty => {
  const fallbackLocation = property.location?.coordinates || property.location;
  const lat =
    typeof fallbackLocation?.lat === "number" ? fallbackLocation.lat : null;
  const lng =
    typeof fallbackLocation?.lng === "number" ? fallbackLocation.lng : null;

  return {
    id: property._id,
    title: property.title || "Untitled property",
    image: property.thumbnail || "/main-hero-banner.jpg",
    location:
      [
        property.location?.address,
        property.address?.street,
        property.address?.city,
        property.address?.island,
      ]
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(", ") || "Location unavailable",
    lat,
    lng,
    price: property.price || 0,
    currency: property.currency || "USD",
    beds: property.bedrooms || 0,
    baths: property.bathrooms || 0,
    href: getDetailsRoute(listingType, property._id),
  };
};

const loadGoogleMapsApi = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (!googleMapsApiKey) {
    return Promise.reject(
      new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file."),
    );
  }

  if (window.__googleMapsLoaderPromise) {
    return window.__googleMapsLoaderPromise;
  }

  window.__googleMapsLoaderPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-maps-loader="true"]',
    );

    const handleLoad = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps failed to initialize."));
      }
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load the Google Maps script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMapsLoader = "true";
    script.onload = handleLoad;
    script.onerror = () =>
      reject(new Error("Failed to load the Google Maps script."));
    document.head.appendChild(script);
  });

  return window.__googleMapsLoaderPromise;
};

export function PropertyMapViewPage({
  listingType,
}: PropertyMapViewPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [mapError, setMapError] = useState<string | null>(null);
  const [autoUpdateOnMove, setAutoUpdateOnMove] = useState(true);
  const [visiblePropertyCount, setVisiblePropertyCount] = useState(0);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<InstanceType<GoogleMapsApi["maps"]["Map"]> | null>(null);
  const markersRef = useRef<Array<InstanceType<GoogleMapsApi["maps"]["Marker"]>>>([]);
  const listenersRef = useRef<Array<{ remove: () => void }>>([]);

  const propertiesQuery = useQuery({
    queryKey: ["property-map-pins", listingType],
    queryFn: () =>
      fetchJson<MapPinsResponse | MapPinApiItem[]>(
        `/rental-properties/map-pins?listingType=${listingType}`,
      ),
  });

  const propertyPins = useMemo(() => {
    const payload = propertiesQuery.data;

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.pins)) {
      return payload.pins;
    }

    if (Array.isArray(payload?.properties)) {
      return payload.properties;
    }

    return [];
  }, [propertiesQuery.data]);

  const properties = useMemo(
    () =>
      propertyPins.map(property =>
        normalizeProperty(property, listingType),
      ),
    [listingType, propertyPins],
  );

  const mappedProperties = useMemo(
    () =>
      properties.filter(
        property => property.lat != null && property.lng != null,
      ),
    [properties],
  );

  useEffect(() => {
    const focusFromQuery = searchParams.get("focus");
    const focusedProperty = mappedProperties.find(
      property => property.id === focusFromQuery,
    );

    if (focusedProperty) {
      setSelectedPropertyId(focusedProperty.id);
      return;
    }

    if (mappedProperties.length) {
      setSelectedPropertyId(mappedProperties[0].id);
    }
  }, [mappedProperties, searchParams]);

  const selectedProperty =
    mappedProperties.find(property => property.id === selectedPropertyId) ||
    mappedProperties[0];

  const selectedGoogleMapsLink = useMemo(() => {
    if (selectedProperty?.lat != null && selectedProperty?.lng != null) {
      return `https://www.google.com/maps/search/?api=1&query=${selectedProperty.lat},${selectedProperty.lng}`;
    }

    return "https://www.google.com/maps";
  }, [selectedProperty]);

  const handleFocusProperty = useCallback((propertyId: string) => {
    setSelectedPropertyId(propertyId);

    const params = new URLSearchParams(searchParams.toString());
    params.set("focus", propertyId);
    router.replace(`${getMapRoute(listingType)}?${params.toString()}`, {
      scroll: false,
    });
  }, [listingType, router, searchParams]);

  useEffect(() => {
    if (!mappedProperties.length || !mapContainerRef.current) {
      return;
    }

    let cancelled = false;

    loadGoogleMapsApi()
      .then(googleInstance => {
        if (cancelled || !mapContainerRef.current) {
          return;
        }

        setMapError(null);

        const fallbackCenter = {
          lat: selectedProperty?.lat ?? mappedProperties[0]?.lat ?? 25.0343,
          lng: selectedProperty?.lng ?? mappedProperties[0]?.lng ?? -77.3963,
        };

        if (!mapRef.current) {
          mapRef.current = new googleInstance.maps.Map(mapContainerRef.current, {
            center: fallbackCenter,
            zoom: mappedProperties.length === 1 ? 14 : 11,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: false,
            gestureHandling: "greedy",
            zoomControl: true,
            styles: MAP_STYLES,
          });
        }

        listenersRef.current.forEach(listener => listener.remove());
        listenersRef.current = [];

        if (mappedProperties.length > 1) {
          const bounds = new googleInstance.maps.LatLngBounds();
          mappedProperties.forEach(property => {
            bounds.extend({
              lat: property.lat as number,
              lng: property.lng as number,
            });
          });
          mapRef.current.fitBounds(bounds, 120);
        } else {
          mapRef.current.setCenter(fallbackCenter);
          mapRef.current.setZoom(14);
        }

        if (selectedProperty?.lat != null && selectedProperty?.lng != null) {
          mapRef.current.panTo({
            lat: selectedProperty.lat,
            lng: selectedProperty.lng,
          });
        }

        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = mappedProperties.map(property => {
          const isSelected = property.id === selectedProperty?.id;

          const marker = new googleInstance.maps.Marker({
            map: mapRef.current,
            position: {
              lat: property.lat as number,
              lng: property.lng as number,
            },
            title: property.title,
            zIndex: isSelected ? 999 : 1,
            icon: createMarkerIcon(isSelected),
          });

          marker.addListener("click", () => {
            handleFocusProperty(property.id);
          });

          return marker;
        });

        const updateVisibleCount = () => {
          const bounds = mapRef.current?.getBounds();

          if (!bounds) {
            setVisiblePropertyCount(mappedProperties.length);
            return;
          }

          const totalVisible = mappedProperties.filter(property =>
            bounds.contains({
              lat: property.lat as number,
              lng: property.lng as number,
            }),
          ).length;

          setVisiblePropertyCount(totalVisible);
        };

        updateVisibleCount();

        listenersRef.current.push(
          googleInstance.maps.event.addListener(mapRef.current, "idle", () => {
            if (autoUpdateOnMove) {
              updateVisibleCount();
            }
          }),
        );
      })
      .catch(error => {
        if (!cancelled) {
          setMapError(error instanceof Error ? error.message : "Could not load Google Maps.");
        }
      });

    return () => {
      cancelled = true;
      listenersRef.current.forEach(listener => listener.remove());
      listenersRef.current = [];
    };
  }, [autoUpdateOnMove, handleFocusProperty, mappedProperties, selectedProperty]);

  return (
    <main className="min-h-screen bg-[#f3f6fb]">
      <Navbar variant="solid" />

      <div className="w-full bg-[radial-gradient(circle_at_top_left,_rgba(142,216,248,0.18),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#f3f6fb_100%)]">
        <div className="mx-auto max-w-[1480px] px-4 py-6 md:px-8 xl:px-10">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push(getListRoute(listingType))}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[14px] font-medium text-[#4b5563] shadow-sm transition-colors hover:text-[#111827]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to listings
              </button>
              <h1 className="text-[28px] font-bold leading-tight text-[#111827] md:text-[34px]">
                {listingType === "buy" ? "Map view for homes on sale" : "Map view for rentals"}
              </h1>
              <p className="mt-2 max-w-2xl text-[14px] text-[#667085]">
                Browse the map, inspect a pin, and open the selected property
                without leaving this view.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-[#dde5ee] bg-white px-4 py-2 text-[13px] font-medium text-[#4b5563] shadow-sm">
                {properties.length} total properties
              </div>
              <a
                href={selectedGoogleMapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#dfe5ec] bg-white px-4 py-2 text-[13px] font-medium text-[#4b5563] shadow-sm transition-colors hover:bg-[#f9fafb]"
              >
                <ExternalLink className="h-4 w-4" />
                Open selected in Google Maps
              </a>
            </div>
          </div>

          {propertiesQuery.isError ? (
            <div className="rounded-[28px] border border-[#f3c7ba] bg-white px-8 py-14 text-center shadow-sm">
              <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-[#f6855c]" />
              <h2 className="text-xl font-bold leading-normal text-black">
                Couldn&apos;t load map pins
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
              <Skeleton className="h-[72vh] w-full rounded-[32px]" />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-40 w-full rounded-[24px]" />
                ))}
              </div>
            </div>
          ) : !properties.length ? (
            <div className="rounded-[28px] border border-[#e6e6eb] bg-white px-8 py-14 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <h2 className="text-xl font-bold leading-normal text-black">
                No properties found
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[#6b7280]">
                There are no properties available for this map view right now.
              </p>
              <button
                type="button"
                onClick={() => router.push(getListRoute(listingType))}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[#d1d5db] px-5 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#f9fafb]"
              >
                Back to listings
              </button>
            </div>
          ) : !mappedProperties.length ? (
            <div className="rounded-[28px] border border-[#e6e6eb] bg-white px-8 py-14 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <h2 className="text-xl font-bold leading-normal text-black">
                No mapped pins available
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-[#6b7280]">
                These properties do not have map coordinates yet, so they
                can&apos;t be placed on the interactive map.
              </p>
            </div>
          ) : (
            <>
              <section className="overflow-hidden rounded-[34px] border border-[#dce6ee] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
                <div className="relative min-h-[74vh] overflow-hidden bg-[#eef6f8] lg:min-h-[78vh]">
                  <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

                  {mapError ? (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 p-6 backdrop-blur-sm">
                      <div className="max-w-md rounded-[24px] border border-[#f3c7ba] bg-white px-6 py-7 text-center shadow-lg">
                        <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-[#f6855c]" />
                        <h3 className="text-lg font-semibold text-[#111827]">
                          Google Map couldn&apos;t load
                        </h3>
                        <p className="mt-2 text-sm text-[#667085]">{mapError}</p>
                        {!googleMapsApiKey ? (
                          <p className="mt-2 text-xs text-[#98A2B3]">
                            Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here` to `.env`, then restart the app.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex items-start justify-between gap-3 sm:left-5 sm:right-5 sm:top-5">
                    <div className="pointer-events-auto inline-flex items-center gap-3 rounded-2xl border border-[#d9dee7] bg-white/95 px-4 py-3 text-[15px] font-medium text-[#4b5563] shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur">
                      <button
                        type="button"
                        onClick={() => setAutoUpdateOnMove(current => !current)}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                          autoUpdateOnMove
                            ? "border-[#4b5563] bg-[#4b5563] text-white"
                            : "border-[#cdd5df] bg-white text-transparent"
                        }`}
                        aria-pressed={autoUpdateOnMove}
                        aria-label="Toggle map updates while moving"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <span>Update map as it moves</span>
                    </div>

                    <div className="hidden h-14 w-14 rounded-full border border-[#d9dee7] bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur md:block" />
                  </div>

                  <div className="pointer-events-none absolute left-1/2 top-5 z-10 -translate-x-1/2">
                    <div className="rounded-2xl border border-[#d9dee7] bg-white/95 px-5 py-4 text-center shadow-[0_14px_40px_rgba(15,23,42,0.12)] backdrop-blur">
                      <p className="text-[15px] font-semibold text-[#555f6d]">
                        Showing {visiblePropertyCount} of {mappedProperties.length} properties
                      </p>
                    </div>
                  </div>

                  {selectedProperty ? (
                    <>
                      <div className="hidden lg:block">
                        <div className="absolute right-5 top-[180px] z-10 w-full max-w-[400px] rounded-[20px] border border-white/70 bg-white/95 p-3 shadow-[0_22px_60px_rgba(15,23,42,0.22)] backdrop-blur">
                          <div className="flex gap-3">
                            <div className="relative h-[158px] w-[46%] overflow-hidden rounded-[16px] bg-[#eef2f6]">
                              <Image
                                src={selectedProperty.image}
                                alt={selectedProperty.title}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col py-2 pr-2">
                              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8b94a1]">
                                {listingType === "buy" ? "House For Sale" : "Home For Rent"}
                              </p>
                              <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-6 text-[#3a4049]">
                                {selectedProperty.title}
                              </h3>
                              <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-[#6b7280]">
                                {selectedProperty.location}
                              </p>

                              <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 text-[14px] text-[#5b6472]">
                                <span className="inline-flex items-center gap-1.5">
                                  <Bed className="h-4 w-4" />
                                  {selectedProperty.beds}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <Bath className="h-4 w-4" />
                                  {selectedProperty.baths}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <CarFront className="h-4 w-4" />
                                  2
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3 rounded-[16px] bg-[#f8fafc] px-4 py-3">
                            <div>
                              <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#8b94a1]">
                                Price
                              </p>
                              <p className="mt-1 text-[20px] font-bold text-[#2f3640]">
                                {selectedProperty.currency} {formatCurrencyValue(selectedProperty.price)}
                                {listingType === "rent" ? "/mo" : ""}
                              </p>
                            </div>
                            <Link
                              href={selectedProperty.href}
                              className="inline-flex h-11 items-center justify-center rounded-full bg-[#2f3640] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#1f2937]"
                            >
                              View details
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/70 bg-white/95 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
                        <div className="flex items-start gap-3">
                          <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-[16px] bg-[#eef2f6]">
                            <Image
                              src={selectedProperty.image}
                              alt={selectedProperty.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8b94a1]">
                              {listingType === "buy" ? "House For Sale" : "Home For Rent"}
                            </p>
                            <h3 className="mt-1 line-clamp-2 text-[16px] font-semibold text-[#111827]">
                              {selectedProperty.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-[13px] text-[#667085]">
                              {selectedProperty.location}
                            </p>
                            <div className="mt-3 flex items-center gap-3 text-[13px] font-medium text-[#475467]">
                              <span className="inline-flex items-center gap-1.5">
                                <BedDouble className="h-4 w-4" />
                                {selectedProperty.beds}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <Bath className="h-4 w-4" />
                                {selectedProperty.baths}
                              </span>
                            </div>
                            <p className="mt-3 text-[16px] font-bold text-[#2f3640]">
                              {selectedProperty.currency} {formatCurrencyValue(selectedProperty.price)}
                              {listingType === "rent" ? "/mo" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <a
                            href={selectedGoogleMapsLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-11 items-center justify-center rounded-full border border-[#dfe5ec] px-4 text-sm font-medium text-[#475467] transition-colors hover:bg-[#f9fafb]"
                          >
                            Open map
                          </a>
                          <Link
                            href={selectedProperty.href}
                            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#2f3640] text-sm font-semibold text-white transition-colors hover:bg-[#1f2937]"
                          >
                            View details
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </section>

              <section className="mt-7">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-[20px] font-semibold text-[#111827]">
                      Browse mapped properties
                    </h3>
                    <p className="mt-1 text-[14px] text-[#6b7280]">
                      Pick a property below to focus its pin and update the preview card.
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-[#4b5563] shadow-sm md:inline-flex">
                    <Building2 className="h-4 w-4" />
                    {mappedProperties.length} mapped listings
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {mappedProperties.map(property => {
                    const isSelected = property.id === selectedProperty?.id;

                    return (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => handleFocusProperty(property.id)}
                        className={`overflow-hidden rounded-[24px] border bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                          isSelected
                            ? "border-[#f2b7c5] ring-2 ring-[#ef1d4f]/10"
                            : "border-[#e7eaef]"
                        }`}
                      >
                        <div className="relative h-40 bg-[#eef2f6]">
                          <Image
                            src={property.image}
                            alt={property.title}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                              {listingType === "buy" ? "For Sale" : "For Rent"}
                            </p>
                            <p className="mt-1 text-[18px] font-semibold text-white">
                              {property.currency} {formatCurrencyValue(property.price)}
                              {listingType === "rent" ? "/mo" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="line-clamp-1 text-[16px] font-semibold text-[#111827]">
                                {property.title}
                              </h4>
                              <p className="mt-1 line-clamp-2 text-[13px] text-[#667085]">
                                {property.location}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
                                isSelected
                                  ? "bg-[#fff1f4] text-[#cc2049]"
                                  : "bg-[#f5f7fb] text-[#677385]"
                              }`}
                            >
                              {isSelected ? "Selected" : "Preview"}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center gap-3 text-[13px] font-medium text-[#475467]">
                            <span className="inline-flex items-center gap-1.5">
                              <BedDouble className="h-4 w-4" />
                              {property.beds}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Bath className="h-4 w-4" />
                              {property.baths}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[#ef1d4f]">
                              <MapPin className="h-4 w-4" />
                              Pin
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  BookmarkPlus,
  ChevronLeft,
  Check,
  Map,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { FilterPanel, type ListingFiltersState } from "@/components/shared/FilterPanel";
import { PropertyCard, PropertyCardSkeleton, type PropertyCardProps } from "@/components/shared/PropertyCard";
import { SortDropdown, type SortOption } from "@/components/shared/SortDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { convertCurrencyAmount, DEFAULT_CURRENCY, formatNumberValue, normalizeCurrencyCode } from "@/lib/currency";
import { useCurrencyPreference } from "@/lib/hooks/useCurrencyPreference";

type ListingType = "rent" | "buy";

interface PropertyListingsPageProps {
  listingType: ListingType;
}

interface CategoryOption {
  _id: string;
  name: string;
  status?: string;
}

interface IslandOption {
  _id: string;
  name: string;
}

interface SavedSearchItem {
  _id: string;
  name: string;
  filters?: {
    search?: string;
    listingType?: ListingType | "";
    island?: { _id?: string; name?: string } | string | null;
    type?: { _id?: string; name?: string } | string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    petFriendly?: boolean | null;
    amenities?: string[];
  };
}

interface RentalPropertyApiItem {
  _id: string;
  listingType?: ListingType;
  basicInformation?: {
    propertyTitle?: string;
    details?: string;
    propertyType?: { _id?: string; name?: string } | string;
    monthlyRent?: number;
    preferredCurrency?: string;
  };
  address?: {
    streetNumber?: string;
    cityTown?: string;
    island?: { _id?: string; name?: string } | string | null;
  };
  location?: {
    address?: string;
    streetNumber?: string;
    cityTown?: string;
    island?: { _id?: string; name?: string } | string | null;
  };
  propertyDetails?: {
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    lotSizeSqFt?: number;
    parkingSpaces?: number;
  };
  rentalTerms?: {
    additional?: {
      petFriendly?: boolean;
    };
  };
  amenities?: {
    amenities?: string[];
    parkingType?: string;
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

const SORT_OPTIONS: SortOption[] = [
  "Newest Listings",
  "Price low to high",
  "Price high to low",
  "Bedrooms most to fewest",
];

const DEFAULT_FILTERS: ListingFiltersState = {
  type: "",
  island: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  bathrooms: "",
  petFriendly: false,
  amenities: [],
};

const AMENITY_OPTIONS = [
  "Air conditioning",
  "Walk in closets",
  "Ceiling fans",
  "Patio",
  "Hardwood floors",
  "Fenced yard",
  "Tile floors",
  "Driveway",
  "Balcony",
  "Dryer",
  "Yard",
  "Dishwasher",
  "Garage",
  "In unit laundry",
  "Washer",
  "Refrigerator",
  "Oven or range",
  "Heating",
  "Microwave",
  "Fireplace",
  "Security system",
  "Carpet",
];

const fetchJson = async <T,>(path: string, accessToken?: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok || !payload?.status) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload.data as T;
};

const getQueryValue = (params: URLSearchParams, key: string) => params.get(key)?.trim() || "";

const getSearchState = (params: URLSearchParams): ListingFiltersState => ({
  type: getQueryValue(params, "type"),
  island: getQueryValue(params, "island"),
  minPrice: getQueryValue(params, "minPrice"),
  maxPrice: getQueryValue(params, "maxPrice"),
  bedrooms: getQueryValue(params, "bedrooms"),
  bathrooms: getQueryValue(params, "bathrooms"),
  petFriendly: params.get("petFriendly") === "true",
  amenities: getQueryValue(params, "amenities")
    ? getQueryValue(params, "amenities").split(",").map((item) => item.trim()).filter(Boolean)
    : [],
});

const isVideoUrl = (url?: string) => Boolean(url && /\.(mp4|webm|ogg|mov)$/i.test(url));

const buildLocationLabel = (property: RentalPropertyApiItem) => {
  const source = property.address;
  const city = source?.cityTown;
  const island = typeof source?.island === "object" ? source?.island?.name : source?.island;
  const street = source?.streetNumber;
  return [street, city, island].filter(Boolean).join(", ") || property.location?.address || "Location not available";
};

const normalizeProperty = (
  property: RentalPropertyApiItem,
  selectedCurrency: string,
  rates: Record<string, number>,
): PropertyCardProps => {
  const mediaUrl = property.photos?.[0]?.url || "/main-hero-banner.jpg";
  const originalPrice = property.basicInformation?.monthlyRent || 0;
  const originalCurrency = normalizeCurrencyCode(
    property.basicInformation?.preferredCurrency || DEFAULT_CURRENCY,
  );
  const convertedPrice = convertCurrencyAmount(
    originalPrice,
    originalCurrency,
    selectedCurrency,
    rates,
  );
  const displayPrice = convertedPrice ?? originalPrice;
  const currency =
    convertedPrice === null
      ? originalCurrency
      : normalizeCurrencyCode(selectedCurrency);
  const parking = property.amenities?.parkingType || "Parking not specified";
  const amenities = property.amenities?.amenities || [];
  const beds = property.propertyDetails?.bedrooms || 0;
  const baths = property.propertyDetails?.bathrooms || 0;
  const area = property.propertyDetails?.squareFeet || property.propertyDetails?.lotSizeSqFt || 0;

  return {
    id: property._id,
    image: mediaUrl,
    title: property.basicInformation?.propertyTitle || "Untitled property",
    location: buildLocationLabel(property),
    parking,
    rating: 5.0,
    reviewCount: 1,
    amenities,
    price: formatNumberValue(displayPrice),
    currency,
    isVideo: isVideoUrl(mediaUrl),
    beds,
    baths,
    areaSqft: area,
    listingType: property.listingType || "rent",
    rawPrice: displayPrice,
    basePrice: originalPrice,
    baseCurrency: originalCurrency,
  };
};

const sortProperties = (items: PropertyCardProps[], sort: SortOption) => {
  const next = [...items];

  if (sort === "Price low to high") {
    next.sort((a, b) => Number(a.rawPrice || 0) - Number(b.rawPrice || 0));
  } else if (sort === "Price high to low") {
    next.sort((a, b) => Number(b.rawPrice || 0) - Number(a.rawPrice || 0));
  } else if (sort === "Bedrooms most to fewest") {
    next.sort((a, b) => (b.beds || 0) - (a.beds || 0));
  }

  return next;
};

export function PropertyListingsPage({ listingType }: PropertyListingsPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState<SortOption>("Newest Listings");
  const token = session?.user?.accessToken;
  const { selectedCurrency, setSelectedCurrency, rates } = useCurrencyPreference();

  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  const page = Number(searchParams.get("page") || "1") || 1;
  const limit = Number(searchParams.get("limit") || "10") || 10;
  const currentFilters = useMemo(() => getSearchState(new URLSearchParams(searchParams.toString())), [searchParams]);

  const createNextUrl = useCallback((updates: Record<string, string | number | boolean | string[] | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === false ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
        return;
      }

      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });

    params.set("listingType", listingType);
    if (params.get("minPrice") || params.get("maxPrice")) {
      params.set("filterCurrency", selectedCurrency);
    } else {
      params.delete("filterCurrency");
    }
    return `?${params.toString()}`;
  }, [listingType, searchParams, selectedCurrency]);

  const propertiesQuery = useQuery({
    queryKey: ["rental-properties", listingType, searchParams.toString(), selectedCurrency],
    queryFn: () => fetchJson<PropertiesResponse>(`/rental-properties${createNextUrl({ listingType, page, limit })}`),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchJson<CategoryOption[]>("/categories"),
  });

  const islandsQuery = useQuery({
    queryKey: ["islands"],
    queryFn: () => fetchJson<{ islands: IslandOption[]; paginationInfo: unknown }>("/islands?page=1&limit=100"),
  });

  const savedSearchesQuery = useQuery({
    queryKey: ["saved-searches", token],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/saved-searches`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const payload = await response.json();
      if (!response.ok || !payload?.status) {
        throw new Error(payload?.message || "Failed to load saved searches");
      }

      return payload.data as SavedSearchItem[];
    },
    enabled: Boolean(token),
  });

  const normalizedProperties = useMemo(() => {
    const mapped = (propertiesQuery.data?.properties || []).map(property =>
      normalizeProperty(property, selectedCurrency, rates),
    );

    return sortProperties(mapped, sort);
  }, [propertiesQuery.data?.properties, rates, selectedCurrency, sort]);

  const resultsLabel = useMemo(() => {
    const count = propertiesQuery.data?.paginationInfo?.totalData || normalizedProperties.length;
    return `${count} ${listingType === "rent" ? "Rentals" : "Properties"} Available`;
  }, [listingType, normalizedProperties.length, propertiesQuery.data?.paginationInfo?.totalData]);

  const submitSearch = () => {
    router.push(createNextUrl({ search: searchInput, page: 1 }));
  };

  const applyFilters = (filters: ListingFiltersState) => {
    router.push(
      createNextUrl({
        ...filters,
        page: 1,
      })
    );
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    router.push(createNextUrl({ ...DEFAULT_FILTERS, search: searchInput, page: 1 }));
  };

  const currentSavedSearchFilters = useMemo(() => {
    const normalizeNumber = (value: string) => {
      if (!value) return null;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? null : parsed;
    };

    return {
      search: (searchParams.get("search") || "").trim(),
      listingType,
      island: currentFilters.island || null,
      type: currentFilters.type || null,
      minPrice: normalizeNumber(currentFilters.minPrice),
      maxPrice: normalizeNumber(currentFilters.maxPrice),
      bedrooms: normalizeNumber(currentFilters.bedrooms),
      bathrooms: normalizeNumber(currentFilters.bathrooms),
      petFriendly: currentFilters.petFriendly ? true : null,
      amenities: [...currentFilters.amenities].sort(),
    };
  }, [currentFilters, listingType, searchParams]);

  const matchingSavedSearch = useMemo(() => {
    const savedSearches = savedSearchesQuery.data || [];

    return (
      savedSearches.find((item) => {
        const filters = item.filters || {};
        const savedAmenities = [...(filters.amenities || [])].sort();
        const savedIsland =
          typeof filters.island === "object" ? filters.island?._id || null : filters.island || null;
        const savedType =
          typeof filters.type === "object" ? filters.type?._id || null : filters.type || null;

        return (
          (filters.search || "").trim() === currentSavedSearchFilters.search &&
          (filters.listingType || "") === currentSavedSearchFilters.listingType &&
          savedIsland === currentSavedSearchFilters.island &&
          savedType === currentSavedSearchFilters.type &&
          (filters.minPrice ?? null) === currentSavedSearchFilters.minPrice &&
          (filters.maxPrice ?? null) === currentSavedSearchFilters.maxPrice &&
          (filters.bedrooms ?? null) === currentSavedSearchFilters.bedrooms &&
          (filters.bathrooms ?? null) === currentSavedSearchFilters.bathrooms &&
          (filters.petFriendly ?? null) === currentSavedSearchFilters.petFriendly &&
          savedAmenities.join("|") === currentSavedSearchFilters.amenities.join("|")
        );
      }) || null
    );
  }, [currentSavedSearchFilters, savedSearchesQuery.data]);

  const savedSearchMutation = useMutation({
    mutationFn: async (mode: "save" | "remove") => {
      if (!token) {
        throw new Error("Please sign in to manage saved searches");
      }

      if (mode === "save") {
        const defaultName = `${listingType === "rent" ? "Rental" : "Buy"} search${
          currentSavedSearchFilters.search ? ` - ${currentSavedSearchFilters.search}` : ""
        }`;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/saved-searches`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: defaultName,
            filters: currentSavedSearchFilters,
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload?.status) {
          throw new Error(payload?.message || "Failed to save search");
        }

        return payload;
      }

      if (!matchingSavedSearch?._id) {
        throw new Error("Saved search not found");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/saved-searches/${matchingSavedSearch._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const payload = await response.json();
      if (!response.ok || !payload?.status) {
        throw new Error(payload?.message || "Failed to remove saved search");
      }

      return payload;
    },
    onSuccess: async (payload, mode) => {
      toast.success(
        payload?.message || (mode === "save" ? "Search saved successfully" : "Saved search removed"),
      );
      await queryClient.invalidateQueries({ queryKey: ["saved-searches"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update saved search");
    },
  });

  const handleMapViewClick = () => {
    const baseRoute = listingType === "buy" ? "/buy/map" : "/rentals/map";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("listingType", listingType);

    if (params.get("minPrice") || params.get("maxPrice")) {
      params.set("filterCurrency", params.get("filterCurrency") || selectedCurrency);
    } else {
      params.delete("filterCurrency");
    }

    const serialized = params.toString();
    router.push(serialized ? `${baseRoute}?${serialized}` : baseRoute);
  };

  const handleSavedSearchToggle = () => {
    if (!token) {
      toast.error("Please sign in to save searches");
      return;
    }

    savedSearchMutation.mutate(matchingSavedSearch ? "remove" : "save");
  };

  const isMetadataLoading = categoriesQuery.isLoading || islandsQuery.isLoading;
  const metadataError = categoriesQuery.error || islandsQuery.error;
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];
    const categoryLabel = categoriesQuery.data?.find((item) => item._id === currentFilters.type)?.name;
    const islandLabel = islandsQuery.data?.islands?.find((item) => item._id === currentFilters.island)?.name;

    if (searchParams.get("search")) {
      chips.push({
        key: "search",
        label: `Search: ${searchParams.get("search")}`,
        onRemove: () => router.push(createNextUrl({ search: null, page: 1 })),
      });
    }
    if (categoryLabel) {
      chips.push({
        key: "type",
        label: `Type: ${categoryLabel}`,
        onRemove: () => router.push(createNextUrl({ type: null, page: 1 })),
      });
    }
    if (islandLabel) {
      chips.push({
        key: "island",
        label: `Island: ${islandLabel}`,
        onRemove: () => router.push(createNextUrl({ island: null, page: 1 })),
      });
    }
    if (currentFilters.minPrice || currentFilters.maxPrice) {
      chips.push({
        key: "price",
        label: `Price (${selectedCurrency}): ${currentFilters.minPrice || "0"} - ${currentFilters.maxPrice || "Any"}`,
        onRemove: () => router.push(createNextUrl({ minPrice: null, maxPrice: null, filterCurrency: null, page: 1 })),
      });
    }
    if (currentFilters.bedrooms) {
      chips.push({
        key: "bedrooms",
        label: `Beds: ${currentFilters.bedrooms}${currentFilters.bedrooms === "5" ? "+" : ""}`,
        onRemove: () => router.push(createNextUrl({ bedrooms: null, page: 1 })),
      });
    }
    if (currentFilters.bathrooms) {
      chips.push({
        key: "bathrooms",
        label: `Baths: ${currentFilters.bathrooms}${currentFilters.bathrooms === "5" ? "+" : ""}`,
        onRemove: () => router.push(createNextUrl({ bathrooms: null, page: 1 })),
      });
    }
    if (currentFilters.petFriendly) {
      chips.push({
        key: "petFriendly",
        label: "Pet Friendly",
        onRemove: () => router.push(createNextUrl({ petFriendly: null, page: 1 })),
      });
    }
    if (currentFilters.amenities.length) {
      chips.push({
        key: "amenities",
        label: `Amenities: ${currentFilters.amenities.length} selected`,
        onRemove: () => router.push(createNextUrl({ amenities: null, page: 1 })),
      });
    }

    return chips;
  }, [categoriesQuery.data, createNextUrl, currentFilters, islandsQuery.data?.islands, router, searchParams, selectedCurrency]);

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f8fb]">
      <Navbar variant="solid" />

      <div className="relative z-30 w-full border-b border-[#edf0f4] bg-white py-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#dfe5ec] bg-white px-4 py-[13px] transition-all focus-within:border-[#8BCCE6] focus-within:ring-2 focus-within:ring-[#8BCCE6]/10">
            <MapPin size={18} className="shrink-0 text-[#9aa3b2]" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submitSearch();
                }
              }}
              placeholder="Location, City or Island..."
              className="w-full flex-1 bg-transparent text-[14px] font-medium text-[#202124] outline-none placeholder:font-normal placeholder:text-[#9aa3b2]"
            />
          </div>

          <div className="flex w-full items-center gap-3 md:w-auto">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#dfe5ec] bg-white px-5 py-[13px] text-[14px] font-semibold text-[#374151] shadow-sm transition-colors hover:bg-[#f9fafb] md:flex-none"
            >
              <SlidersHorizontal size={16} className="text-[#6b7280]" />
              Filters
              {activeFilterChips.length ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#202124] px-1.5 text-[11px] font-semibold text-white">
                  {activeFilterChips.length}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={submitSearch}
              style={{ background: "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)" }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-7 py-[13px] text-[14px] font-semibold text-white shadow-md transition-opacity hover:opacity-90 md:flex-none"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex-1 w-full max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {propertiesQuery.isLoading ? (
            <Skeleton className="h-9 w-56 rounded-xl" />
          ) : (
            <h1 className="text-[24px] font-bold leading-normal text-black">{resultsLabel}</h1>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSavedSearchToggle}
              disabled={savedSearchMutation.isPending || savedSearchesQuery.isLoading}
              className={`inline-flex items-center gap-1.5 rounded-lg border bg-white px-3.5 py-2 text-sm font-medium shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                matchingSavedSearch
                  ? "border-[#f7c6b5] text-[#f6855c] hover:bg-[#fff5f4]"
                  : "border-[#e5e7eb] text-[#4b5563] hover:bg-[#fafafa]"
              }`}
            >
              <BookmarkPlus
                size={16}
                className={matchingSavedSearch ? "text-[#f6855c]" : "text-[#6b7280]"}
              />
              {matchingSavedSearch ? "Saved Search" : "Save this Search"}
            </button>
            <CurrencySelector
              value={selectedCurrency}
              onChange={setSelectedCurrency}
            />
            <button
              type="button"
              onClick={handleMapViewClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2 text-sm font-medium text-[#4b5563] shadow-sm transition-colors hover:bg-[#fafafa]"
            >
              <Map size={16} className="text-[#6b7280]" />
              Map View
            </button>
            <SortDropdown selected={sort} onChange={setSort} options={SORT_OPTIONS} />
          </div>
        </div>

        {activeFilterChips.length ? (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-2 rounded-full border border-[#dfe5ec] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] shadow-sm transition-colors hover:bg-[#f9fafb]"
              >
                <Check className="h-3.5 w-3.5 text-[#4db56b]" />
                {chip.label}
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-[#f6855c] underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        ) : null}

        {propertiesQuery.isError ? (
          <div className="rounded-[28px] border border-[#f3c7ba] bg-white px-8 py-14 text-center shadow-sm">
            <TriangleAlert className="mx-auto mb-4 h-10 w-10 text-[#f6855c]" />
            <h2 className="text-xl font-bold leading-normal text-black">Couldn&apos;t load properties</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#6b7280]">
              {propertiesQuery.error instanceof Error
                ? propertiesQuery.error.message
                : "Please try again. If the problem continues, check your filters or network connection."}
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : normalizedProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {normalizedProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>

            {(propertiesQuery.data?.paginationInfo.totalData || 0) > 10 ? (
              <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#e6e6eb] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] md:flex-row">
                <p className="text-sm text-[#6b7280]">
                  Page {propertiesQuery.data?.paginationInfo.currentPage || 1} of{" "}
                  {propertiesQuery.data?.paginationInfo.totalPages || 1}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!propertiesQuery.data?.paginationInfo.hasPrevPage}
                    onClick={() => router.push(createNextUrl({ page: page - 1 }))}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d1d5db] px-4 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={!propertiesQuery.data?.paginationInfo.hasNextPage}
                    onClick={() => router.push(createNextUrl({ page: page + 1 }))}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d1d5db] px-4 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-[28px] border border-[#e6e6eb] bg-white px-8 py-14 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h2 className="text-xl font-bold leading-normal text-black">No properties found</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#6b7280]">
              We couldn&apos;t find any {listingType === "rent" ? "rentals" : "buy properties"} for the current search and filter selection.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[#d1d5db] px-5 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#f9fafb]"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <Footer />

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title={listingType === "rent" ? "Rental Filters" : "Buy Filters"}
        filters={currentFilters}
        categories={categoriesQuery.data || []}
        islands={islandsQuery.data?.islands || []}
        amenities={AMENITY_OPTIONS}
        selectedCurrency={selectedCurrency}
        loading={isMetadataLoading}
        error={metadataError instanceof Error ? metadataError.message : null}
        onApply={applyFilters}
        onClear={clearFilters}
      />
    </main>
  );
}

"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ArrowLeft, BookmarkPlus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SavedSearchItem {
  _id: string;
  name: string;
  createdAt: string;
  filters?: {
    search?: string;
    listingType?: "rent" | "buy" | "";
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

const getFilterSummary = (item: SavedSearchItem) => {
  const filters = item.filters || {};
  const chunks: string[] = [];

  if (filters.search) chunks.push(`Search: ${filters.search}`);
  if (filters.listingType) chunks.push(filters.listingType === "rent" ? "Rentals" : "Buy");
  if (filters.type) {
    chunks.push(
      `Type: ${typeof filters.type === "object" ? filters.type?.name || "Selected" : filters.type}`,
    );
  }
  if (filters.island) {
    chunks.push(
      `Island: ${typeof filters.island === "object" ? filters.island?.name || "Selected" : filters.island}`,
    );
  }
  if (filters.minPrice || filters.maxPrice) {
    chunks.push(`Price: ${filters.minPrice || 0} - ${filters.maxPrice || "Any"}`);
  }
  if (filters.bedrooms) chunks.push(`Beds: ${filters.bedrooms}`);
  if (filters.bathrooms) chunks.push(`Baths: ${filters.bathrooms}`);
  if (filters.petFriendly) chunks.push("Pet friendly");
  if (filters.amenities?.length) chunks.push(`${filters.amenities.length} amenities`);

  return chunks.length ? chunks.join(" • ") : "No filters saved";
};

const getSavedSearchHref = (item: SavedSearchItem) => {
  const filters = item.filters || {};
  const basePath = filters.listingType === "buy" ? "/buy" : "/rentals";
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.listingType) params.set("listingType", filters.listingType);

  const islandId =
    typeof filters.island === "object" ? filters.island?._id : filters.island;
  const typeId = typeof filters.type === "object" ? filters.type?._id : filters.type;

  if (islandId) params.set("island", islandId);
  if (typeId) params.set("type", typeId);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.bedrooms != null) params.set("bedrooms", String(filters.bedrooms));
  if (filters.bathrooms != null) params.set("bathrooms", String(filters.bathrooms));
  if (filters.petFriendly) params.set("petFriendly", "true");
  if (filters.amenities?.length) params.set("amenities", filters.amenities.join(","));

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};

export default function SavedSearchesContainer() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const token = session?.user?.accessToken;

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

  const removeSavedSearchMutation = useMutation({
    mutationFn: async (savedSearchId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/saved-searches/${savedSearchId}`,
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
    onSuccess: async (payload) => {
      toast.success(payload?.message || "Saved search removed");
      await queryClient.invalidateQueries({ queryKey: ["saved-searches"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove saved search",
      );
    },
  });

  const savedSearches = savedSearchesQuery.data || [];
  const savedSearchCount = useMemo(() => savedSearches.length, [savedSearches]);

  return (
    <main className="min-h-screen bg-[#f6f7f9]">
      <div className="w-full border-b border-[#e9edf2] bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold leading-normal text-black md:text-2xl lg:text-3xl">
              Saved Searches
            </h1>
            <p className="mt-1 text-sm font-normal leading-normal text-[#262626] md:text-base">
              Save your search filters for later.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-black transition-colors hover:text-[#111827]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        <div className="mb-6 rounded-2xl border border-[#d7e5fb] bg-[#eef5ff] px-4 py-4 text-[13px] leading-6 text-[#2453a6]">
          Looking for saved properties?
          <br />
          Saved properties live in <Link href="/favorites" className="font-semibold underline underline-offset-2">Favorites</Link>. This page stores only your saved search filters.
        </div>

        {savedSearchesQuery.isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[20px] border border-[#eceef2] bg-white p-5">
                <div className="mb-4 h-5 w-32 animate-pulse rounded bg-[#eef2f6]" />
                <div className="mb-3 h-4 w-full animate-pulse rounded bg-[#eef2f6]" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-[#eef2f6]" />
              </div>
            ))}
          </div>
        ) : savedSearchesQuery.isError ? (
          <div className="rounded-[20px] border border-[#f3c7ba] bg-white px-6 py-12 text-center">
            <h2 className="text-xl font-semibold text-[#111827]">
              Couldn&apos;t load saved searches
            </h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              {savedSearchesQuery.error instanceof Error
                ? savedSearchesQuery.error.message
                : "Please try again in a moment."}
            </p>
          </div>
        ) : savedSearchCount === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[20px] border border-[#eceef2] bg-white px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#dbe1e8] bg-[#fbfcfd]">
              <Search className="h-7 w-7 text-[#344054]" />
            </div>
            <h2 className="text-2xl font-semibold text-[#344054]">No saved search yet</h2>
            <p className="mt-2 max-w-md text-sm text-[#667085]">
              Browse rentals or sales and save your current filters from the listing page.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/rentals"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d1d5db] px-4 text-sm font-medium text-[#374151] transition-colors hover:bg-[#f9fafb]"
              >
                Browse Rentals
              </Link>
              <Link
                href="/buy"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d1d5db] px-4 text-sm font-medium text-[#374151] transition-colors hover:bg-[#f9fafb]"
              >
                Browse Sales
              </Link>
              <Link
                href="/favorites"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d1d5db] px-4 text-sm font-medium text-[#374151] transition-colors hover:bg-[#f9fafb]"
              >
                Favorites
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {savedSearches.map((item) => (
              <article
                key={item._id}
                className="rounded-[20px] border border-[#eceef2] bg-white p-5 shadow-[0_6px_22px_rgba(15,23,42,0.05)]"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#98a2b3]">
                      {item.filters?.listingType === "buy" ? "Buy" : "Rentals"}
                    </p>
                    <h2 className="mt-1 text-[20px] font-semibold text-[#111827]">
                      {item.name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSavedSearchMutation.mutate(item._id)}
                    disabled={removeSavedSearchMutation.isPending}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f1d2c7] text-[#f6855c] transition-colors hover:bg-[#fff5f4] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Delete saved search"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm leading-6 text-[#667085]">
                  {getFilterSummary(item)}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-[12px] text-[#98a2b3]">
                    {new Date(item.createdAt).toLocaleDateString("en-US")}
                  </span>
                  <Link
                    href={getSavedSearchHref(item)}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm"
                    style={{
                      background:
                        "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)",
                    }}
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    Open Search
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

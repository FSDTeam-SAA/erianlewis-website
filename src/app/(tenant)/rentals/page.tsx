import type { Metadata } from "next";
import { PropertyListingsPage } from "@/components/shared/PropertyListingsPage";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = createMetadata({
  title: "Alora Rentals",
  description:
    "Find apartments, homes, and island rental listings with Alora.",
  path: "/rentals",
  keywords: ["Alora rentals", "island apartments", "homes for rent"],
});

export default function RentalsPage() {
    return <PropertyListingsPage listingType="rent" />;
}

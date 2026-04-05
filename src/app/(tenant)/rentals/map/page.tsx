import type { Metadata } from "next";
import { PropertyMapViewPage } from "@/components/shared/PropertyMapViewPage";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = createMetadata({
  title: "Alora Rental Map",
  description:
    "Explore rental listings on an interactive map to find your next stay or home with Alora.",
  path: "/rentals/map",
  keywords: ["rental map", "Alora rental search"],
});

export default function RentalsMapPage() {
  return <PropertyMapViewPage listingType="rent" />;
}

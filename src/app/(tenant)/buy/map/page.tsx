import type { Metadata } from "next";
import { PropertyMapViewPage } from "@/components/shared/PropertyMapViewPage";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = createMetadata({
  title: "Alora Properties for Sale Map",
  description:
    "View homes and properties for sale on an interactive map with Alora.",
  path: "/buy/map",
  keywords: ["property map", "Alora real estate map"],
});

export default function BuyMapPage() {
  return <PropertyMapViewPage listingType="buy" />;
}

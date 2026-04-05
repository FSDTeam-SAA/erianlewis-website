import type { Metadata } from "next";
import { PropertyListingsPage } from "@/components/shared/PropertyListingsPage";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = createMetadata({
  title: "Homes for Sale on Alora",
  description:
    "Browse homes and island properties for sale on Alora.",
  path: "/buy",
  keywords: ["Alora homes for sale", "buy property on Alora", "island homes"],
});

export default function BuyPage() {
  return <PropertyListingsPage listingType="buy" />;
}

import type { Metadata } from "next";
import { PropertyDetailsPage } from "@/components/shared/PropertyDetailsPage";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  return createMetadata({
    title: "Property for Sale Details",
    description:
      "View photos, pricing, location details, and listing information for properties for sale on Alora.",
    path: `/buy/${params.id}`,
    keywords: ["property details", "Alora property listing"],
  });
}

export default function BuyPropertyDetails() {
    return <PropertyDetailsPage listingType="buy" />;
}

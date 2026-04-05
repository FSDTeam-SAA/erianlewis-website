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
    title: "Rental Property Details",
    description:
      "View rental pricing, amenities, photos, and location details for rental properties on Alora.",
    path: `/rentals/${params.id}`,
    keywords: ["rental property details", "Alora rental listing"],
  });
}

export default function RentalPropertyDetails() {
    return <PropertyDetailsPage listingType="rent" />;
}

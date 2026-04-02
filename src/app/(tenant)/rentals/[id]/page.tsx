import { PropertyDetailsPage } from "@/components/shared/PropertyDetailsPage";

export const dynamic = "force-dynamic";

export default function RentalPropertyDetails() {
    return <PropertyDetailsPage listingType="rent" />;
}

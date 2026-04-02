import { PropertyListingsPage } from "@/components/shared/PropertyListingsPage";

export const dynamic = "force-dynamic";

export default function RentalsPage() {
    return <PropertyListingsPage listingType="rent" />;
}

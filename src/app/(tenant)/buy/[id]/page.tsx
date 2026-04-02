import { PropertyDetailsPage } from "@/components/shared/PropertyDetailsPage";

export const dynamic = "force-dynamic";

export default function BuyPropertyDetails() {
    return <PropertyDetailsPage listingType="buy" />;
}

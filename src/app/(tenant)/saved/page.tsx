import type { Metadata } from "next";
import SavedSearchesContainer from "./_components/saved-searches-container";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Saved Searches",
  description: "Manage your saved property searches on Alora.",
  path: "/saved",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default function SavedSearchesPage() {
  return <SavedSearchesContainer />;
}

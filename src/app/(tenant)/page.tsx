import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/shared/HeroSection";
import { BrowseByCategory } from "@/components/shared/BrowseByCategory";
import { Footer } from "@/components/shared/Footer";

export default function TenantHomepage() {
    return (
        <main className="min-h-screen flex flex-col font-sans relative bg-[#F9FAFB]">
            <Navbar />
            <HeroSection />
            <BrowseByCategory />
            <Footer />
        </main>
    );
}

import { Building2, TrendingUp, Users } from "lucide-react";
import { StatCard } from "./StatCard";

const STATS = [
    {
        title: "Total Site Visits",
        value: "4,015",
        subtitle: "All-time",
        icon: TrendingUp,
        gradient: "linear-gradient(135deg, #8BCCE6 0%, #5EAACB 100%)",
    },
    {
        title: "Registered User",
        value: "26",
        subtitle: "Tenants + Landlords + Agents",
        icon: Users,
        gradient: "linear-gradient(135deg, #F6A27E 0%, #F6855C 100%)",
    },
    {
        title: "Listed Properties",
        value: "4,015",
        subtitle: "Across all categories",
        icon: Building2,
        gradient: "linear-gradient(135deg, #3B4354 0%, #1F2937 100%)",
    },
];

export function StatsSection() {
    return (
        <section className="px-6 max-w-7xl mx-auto -mt-16 md:-mt-24 relative z-30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STATS.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>
        </section>
    );
}

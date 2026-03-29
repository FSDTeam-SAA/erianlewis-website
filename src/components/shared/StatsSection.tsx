import { StatCard } from "./StatCard";

const STATS = [
    { title: "Total Site Visits", value: "4,015", subtitle: "All-time", variant: "blue" as const },
    { title: "Registered User", value: "26", subtitle: "Tenants + Landlords + Agents", variant: "orange" as const },
    { title: "Total Site Visits", value: "4,015", subtitle: "All-time", variant: "dark" as const },
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

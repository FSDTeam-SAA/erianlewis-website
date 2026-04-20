import { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: string
    subtitle: string
    icon: LucideIcon
    gradient: string
}

export function StatCard({ title, value, subtitle, icon: Icon, gradient }: StatCardProps) {
    return (
        <div
            style={{ background: gradient }}
            className="relative rounded-2xl p-5 text-white overflow-hidden min-h-[130px] flex flex-col justify-between"
        >
            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2 pr-10">
                    <Icon size={18} className="shrink-0" />
                    <span className="text-sm font-semibold">{title}</span>
                </div>
                <Icon size={48} className="opacity-30 absolute top-4 right-4 z-0" />
            </div>
            <div className="text-4xl font-extrabold mt-2 relative z-10 drop-shadow-sm">{value}</div>
            <div className="text-sm font-medium mt-1 relative z-10 pr-2">{subtitle}</div>
        </div>
    )
}

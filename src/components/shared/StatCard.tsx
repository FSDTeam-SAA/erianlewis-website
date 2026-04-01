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
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={18} className="opacity-100" />
                    <span className="text-xs font-medium opacity-90">{title}</span>
                </div>
                <Icon size={36} className="opacity-20 absolute top-4 right-4" />
            </div>
            <div className="text-4xl font-bold mt-2">{value}</div>
            <div className="text-xs opacity-60 mt-1">{subtitle}</div>
        </div>
    )
}

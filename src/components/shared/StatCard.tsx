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
                    <Icon size={15} className="opacity-80" />
                    <span className="text-xs font-medium opacity-80">{title}</span>
                </div>
                <Icon size={64} className="opacity-10 absolute -top-2 -right-2" />
            </div>
            <div className="text-4xl font-bold mt-2">{value}</div>
            <div className="text-xs opacity-60 mt-1">{subtitle}</div>
        </div>
    )
}

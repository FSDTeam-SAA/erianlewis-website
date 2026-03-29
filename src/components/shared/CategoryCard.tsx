import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
    label: string;
    icon: LucideIcon;
}

export function CategoryCard({ label, icon: Icon }: CategoryCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-[24px] flex flex-col items-center justify-center gap-[10px] transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer border border-gray-100">
            <div
                className="w-[64px] h-[64px] rounded-[32px] p-[16px] text-white flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(132.51deg, #9CC1D1 16.98%, #E98D6C 64.39%)' }}
            >
                <Icon className="w-full h-full" />
            </div>
            <span className="text-[14px] font-semibold text-gray-800 text-center leading-[1.2] mt-1">{label}</span>
        </div>
    );
}

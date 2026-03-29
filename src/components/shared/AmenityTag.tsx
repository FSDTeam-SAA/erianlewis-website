interface AmenityTagProps {
    label: string;
}

export function AmenityTag({ label }: AmenityTagProps) {
    return (
        <span className="text-[12px] font-semibold border border-gray-200 rounded-full px-4 py-1.5 text-gray-600 bg-gray-50 shadow-sm transition-colors hover:bg-gray-100 cursor-default tracking-tight">
            {label}
        </span>
    );
}

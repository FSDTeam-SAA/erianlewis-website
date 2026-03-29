interface SpecItem {
    label: string;
    value: string | number;
}

interface PropertySpecGridProps {
    specs: SpecItem[];
}

export function PropertySpecGrid({ specs }: PropertySpecGridProps) {
    return (
        <div className="border border-gray-100 rounded-2xl overflow-hidden grid grid-cols-3 bg-white shadow-sm">
            {specs.map((spec, i) => (
                <div
                    key={i}
                    className={`p-4 ${i < 3 ? 'border-b border-gray-100' : ''} ${i % 3 !== 2 ? 'border-r border-gray-100' : ''} hover:bg-gray-50/50 transition-colors`}
                >
                    <p className="text-[11px] font-bold text-gray-400 mb-1 block">{spec.label}</p>
                    <p className="text-[14px] font-bold text-gray-800">{spec.value}</p>
                </div>
            ))}
        </div>
    );
}

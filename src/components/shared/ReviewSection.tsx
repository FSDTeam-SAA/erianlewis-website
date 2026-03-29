import { Star } from "lucide-react";

export function ReviewSection() {
    return (
        <div className="mt-8">
            {/* Header and Jump Link */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-bold text-gray-900">Reviews</h2>
                <button className="text-[12px] font-bold text-orange-500 hover:text-orange-600 hover:underline transition-all">Jump to comments</button>
            </div>

            {/* Main Rating Stars */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={15} className="text-yellow-400 fill-yellow-400" />
                    ))}
                </div>
                <span className="text-[13px] text-gray-700 font-bold">5.0 <span className="font-medium text-gray-500">(1)</span></span>
            </div>

            {/* Leave Review CTA */}
            <button className="text-[13px] font-bold text-blue-500 hover:text-blue-600 hover:underline transition-all mb-6 block">Leave a review</button>

            {/* Comments List */}
            <h3 className="text-[13px] font-bold text-gray-700 mb-3">Comments</h3>
            <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[14px] font-bold text-gray-900">Buyer Waqas</span>
                    <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                            ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-500">5.0 (1)</span>
                    </div>
                </div>
                <p className="text-[13px] text-gray-400 font-medium">No comment.</p>
            </div>
        </div>
    );
}

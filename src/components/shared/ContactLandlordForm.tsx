import { Phone, Mail } from "lucide-react";

interface ContactLandlordFormProps {
    onScheduleClick: () => void;
}

export function ContactLandlordForm({ onScheduleClick }: ContactLandlordFormProps) {
    return (
        <div className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-white sticky top-6">
            <h3 className="text-lg font-extrabold text-gray-900 mb-5">Contact Landlord</h3>

            <form onSubmit={(e) => e.preventDefault()}>
                {/* Full Name */}
                <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Full Name*</label>
                <input
                    placeholder="John Doe"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium text-gray-800 mb-4 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                />

                {/* Email */}
                <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Email*</label>
                <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium text-gray-800 mb-4 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                />

                {/* Phone */}
                <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Phone</label>
                <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium text-gray-800 mb-4 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                />

                {/* Message */}
                <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Message*</label>
                <textarea
                    placeholder="I am interested in this property..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-800 mb-5 outline-none resize-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                />

                {/* Request Information - gradient button */}
                <button
                    type="submit"
                    style={{ background: 'linear-gradient(102.89deg, #80BDEA 0%, #FF7D51 100%)' }}
                    className="w-full text-white py-3.5 rounded-xl text-[15px] font-bold mb-4 shadow-md hover:opacity-90 transition-opacity tracking-wide"
                >
                    Request Information
                </button>
            </form>

            {/* Call + Email buttons */}
            <div className="flex gap-3 mb-4">
                <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    <Phone size={16} className="text-gray-500" /> Call
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    <Mail size={16} className="text-gray-500" /> Email
                </button>
            </div>

            {/* Schedule Viewing - orange gradient */}
            <button
                onClick={onScheduleClick}
                style={{ background: 'linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)' }}
                className="w-full text-white py-3.5 rounded-xl text-[15px] font-bold shadow-md hover:opacity-90 transition-opacity tracking-wide"
            >
                Schedule Viewing
            </button>
        </div>
    );
}

import { Mail } from "lucide-react";
import { SupportLayout } from "@/components/shared/SupportLayout";

export default function ContactSupportPage() {
    return (
        <SupportLayout activeTab="contact">
            <div className="max-w-lg">
                <h2 className="text-[17px] font-bold text-gray-900 mb-1.5">Contact</h2>
                <p className="text-[14px] font-medium text-gray-500 mb-6">
                    You can reach Alora Reality Support at:
                </p>

                <div className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-gray-50/50">
                    <p className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wide block">Email</p>

                    {/* Email button - gradient */}
                    <a href="mailto:info@alorarrealty.com" className="block mb-5">
                        <button
                            style={{ background: 'linear-gradient(102.89deg, #80BDEA 0%, #FF7D51 100%)' }}
                            className="w-full flex items-center justify-center gap-2 text-white py-3.5 px-4 rounded-xl text-[15px] font-bold shadow-md hover:opacity-90 transition-opacity tracking-wide"
                        >
                            <Mail size={18} />
                            info@alorarrealty.com
                        </button>
                    </a>

                    <p className="text-[13px] font-medium text-gray-500 leading-relaxed text-center">
                        If your device doesn&apos;t open email automatic, Copy paste:{' '}
                        <span className="text-gray-800 font-bold block mt-1.5 text-[14px]">info@alorarrealty.com</span>
                    </p>
                </div>
            </div>
        </SupportLayout>
    );
}

"use client";

import { X, Minus } from "lucide-react";

interface ScheduleViewingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ScheduleViewingModal({ isOpen, onClose }: ScheduleViewingModalProps) {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="fixed right-4 top-20 w-[340px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 animate-in slide-in-from-right-8 fade-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[17px] font-extrabold text-gray-900 tracking-tight">Schedule Viewing</h3>
                    <div className="flex items-center gap-2.5">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors"><Minus size={20} className="stroke-[2.5]" /></button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors"><X size={20} className="stroke-[2.5]" /></button>
                    </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    {/* Preferred Date */}
                    <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Preferred Date*</label>
                    <div className="relative mb-4">
                        <input
                            type="date"
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 font-medium text-gray-800 transition-all text-gray-500"
                        />
                    </div>

                    {/* Preferred Time */}
                    <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Preferred Time*</label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] outline-none mb-4 font-medium focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-gray-500 bg-white cursor-pointer">
                        <option value="">Select a time</option>
                        <option>9:00 AM</option>
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>2:00 PM</option>
                        <option>3:00 PM</option>
                    </select>

                    {/* Timezone */}
                    <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Timezone*</label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] outline-none mb-3 font-medium focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-gray-800 bg-white cursor-pointer">
                        <option>Trinidad and Tobago (AST)</option>
                        <option>Eastern Time (ET)</option>
                        <option>Pacific Time (PT)</option>
                    </select>

                    <p className="text-[11px] font-semibold text-gray-400 mb-6 leading-tight">
                        We'll share this with your request so the owner knows what timezone you selected.
                    </p>

                    {/* Your Name */}
                    <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Your Name*</label>
                    <input
                        placeholder="John Doe"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] mb-4 outline-none font-medium text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                    />

                    {/* Email */}
                    <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Email*</label>
                    <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] mb-4 outline-none font-medium text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                    />

                    {/* Phone */}
                    <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Phone*</label>
                    <input
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] mb-4 outline-none font-medium text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                    />

                    {/* Message Optional */}
                    <label className="text-[13px] font-bold text-gray-500 mb-1.5 block">Message(Optional)</label>
                    <textarea
                        placeholder="Any Special requests or questions..."
                        rows={2}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] mb-6 outline-none resize-none font-medium text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder:font-normal"
                    />

                    {/* Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-200 rounded-xl py-3.5 text-[14px] font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] text-white rounded-xl py-3.5 text-[14px] font-bold shadow-md hover:opacity-90 transition-opacity tracking-wide"
                            style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

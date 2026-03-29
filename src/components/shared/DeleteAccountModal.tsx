"use client";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200">
                <h3 className="text-base font-bold text-gray-900 mb-2">Delete your account?</h3>
                <p className="text-sm font-medium text-gray-500 mb-1">This will permanently delete your profile, listings, and saved data.</p>
                <p className="text-sm font-medium text-gray-500 mb-5">This cannot be undone.</p>

                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Password</label>
                <div className="relative mb-6">
                    <input type="password" placeholder="password"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm pr-12 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all font-medium text-gray-800" />
                    <button className="absolute right-4 top-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Show</button>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        style={{ background: 'linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)' }}
                        className="flex-1 text-white rounded-lg py-2.5 text-sm font-bold shadow-md hover:opacity-90 transition-opacity">
                        Yes, delete account
                    </button>
                </div>
            </div>
        </div>
    );
}

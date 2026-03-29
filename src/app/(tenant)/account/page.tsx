"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ListingNavbar } from "@/components/shared/ListingNavbar";
import { Footer } from "@/components/shared/Footer";
import { SettingsCard } from "@/components/shared/SettingsCard";
import { DeleteAccountModal } from "@/components/shared/DeleteAccountModal";
import { ArrowLeft, LogOut, Settings, ChevronRight, Trash2 } from "lucide-react";

export default function TenantAccountPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [securityOpen, setSecurityOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    // Form states for inputs
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");

    const handleSignOut = () => { /* Handle sign out */ };
    const handleSaveChanges = () => { /* Handle profile save */ };
    const handleUpdatePassword = () => { /* Handle password update */ };
    const handleUpdateEmail = () => { /* Handle email update */ };

    return (
        <main className="min-h-screen flex flex-col bg-gray-100 font-sans">
            <ListingNavbar />

            <div className="flex-1 w-full pb-16">
                {/* Top breadcrumb */}
                <div className="px-6 py-4 max-w-5xl mx-auto w-full">
                    <span className="text-sm font-semibold text-gray-500 tracking-wide uppercase">My Account</span>
                </div>

                {/* Main white card */}
                <SettingsCard>

                    {/* SECTION 1: PAGE HEADER */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-3">
                        <div>
                            <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight">My Account</h1>
                            <p className="text-[15px] text-gray-500 mt-1 font-medium">Manage your account settings</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    </div>

                    {/* SECTION 2: ACCOUNT */}
                    <div className="mb-10">
                        <h2 className="text-lg font-bold text-gray-900 mb-1.5">Account</h2>
                        <p className="text-[15px] text-gray-500 mb-6 font-medium">
                            Signed in as <span className="font-bold text-gray-800">{session?.user?.email || "user@example.com"}</span>
                        </p>

                        <div className="flex items-center justify-between">
                            {/* Sign Out button - blue gradient */}
                            <button
                                style={{ background: 'linear-gradient(102.89deg, #80BDEA 0%, #4E8BE3 100%)' }}
                                className="flex items-center justify-center gap-2.5 text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity"
                                onClick={handleSignOut}
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>

                            {/* Go to Homepage link */}
                            <button
                                onClick={() => router.push('/')}
                                className="text-[15px] font-bold text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                Go to Homepage
                            </button>
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-8" />

                    {/* SECTION 3: SECURITY (collapsible toggle) */}
                    <div className="mb-8">
                        <button
                            onClick={() => setSecurityOpen(!securityOpen)}
                            className="flex items-center gap-3 text-lg font-bold text-gray-900 hover:opacity-80 transition-opacity group"
                        >
                            <div className={`w-[18px] h-[18px] rounded-full border-[3px] transition-colors flex items-center justify-center ${securityOpen ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                <div className={`w-2 h-2 rounded-full bg-white transition-opacity ${securityOpen ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                            Security
                        </button>
                        <p className="text-[15px] text-gray-500 mt-2 ml-[30px] font-medium">Change password or email.</p>
                    </div>

                    <hr className="border-gray-100 mb-8" />

                    {/* SECTION 4: PROFILE SETTINGS */}
                    {securityOpen && (
                        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>
                                {/* Save changes button - blue gradient */}
                                <button
                                    style={{ background: 'linear-gradient(102.89deg, #80BDEA 0%, #4E8BE3 100%)' }}
                                    className="flex items-center justify-center gap-2 text-white text-sm px-5 py-2.5 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity"
                                    onClick={handleSaveChanges}
                                >
                                    <Settings size={16} />
                                    Save changes
                                </button>
                            </div>

                            {/* Personal Information card */}
                            <div className="border border-gray-100 rounded-xl p-6 mb-6 shadow-sm">
                                <h3 className="text-base font-bold text-gray-800 mb-5">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-[13px] font-bold text-gray-500 mb-2 block">Full Name</label>
                                        <input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[15px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[13px] font-bold text-gray-500 mb-2 block">Phone number</label>
                                        <input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[15px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Change Password + Change Email — side by side */}
                            <div className="border border-gray-100 rounded-xl p-6 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                                    {/* LEFT: Change Password */}
                                    <div>
                                        <h3 className="text-base font-bold text-gray-800 mb-1.5">Change Password</h3>
                                        <p className="text-[13px] font-medium text-gray-400 mb-6">New password must be at least 8 characters.</p>

                                        {/* Current password */}
                                        <label className="text-[13px] font-bold text-gray-500 mb-2 block">Current password</label>
                                        <div className="relative mb-5">
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Current password"
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[15px] pr-12 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800"
                                            />
                                            <button className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Show</button>
                                        </div>

                                        {/* New password */}
                                        <label className="text-[13px] font-bold text-gray-500 mb-2 block">New password</label>
                                        <div className="relative mb-5">
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="New password"
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[15px] pr-12 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800"
                                            />
                                            <button className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Show</button>
                                        </div>

                                        {/* Confirm password */}
                                        <label className="text-[13px] font-bold text-gray-500 mb-2 block">Confirm New password</label>
                                        <div className="relative mb-6">
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm New password"
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[15px] pr-12 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800"
                                            />
                                            <button className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Show</button>
                                        </div>

                                        {/* Update Password button - gradient */}
                                        <button
                                            style={{ background: 'linear-gradient(102.89deg, #80BDEA 0%, #FF7D51 100%)' }}
                                            className="w-full text-white py-3.5 rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-opacity mb-5"
                                            onClick={handleUpdatePassword}
                                        >
                                            Update Password
                                        </button>
                                        <button
                                            onClick={() => router.push('/forgot-password')}
                                            className="text-[13px] font-bold text-gray-400 hover:text-gray-700 transition-colors block mx-auto tracking-wide"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>

                                    {/* RIGHT: Change Email */}
                                    <div>
                                        <h3 className="text-base font-bold text-gray-800 mb-1.5">Change email</h3>
                                        <p className="text-[13px] font-medium text-gray-400 mb-6">You'll need your password to confirm this change.</p>

                                        <label className="text-[13px] font-bold text-gray-500 mb-2 block">New email</label>
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            placeholder="New email@gmail.com"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[15px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800 mb-5"
                                        />

                                        <label className="text-[13px] font-bold text-gray-500 mb-2 block">Password</label>
                                        <div className="relative mb-6">
                                            <input
                                                type="password"
                                                value={emailPassword}
                                                onChange={(e) => setEmailPassword(e.target.value)}
                                                placeholder="password"
                                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[15px] pr-12 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-800"
                                            />
                                            <button className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Show</button>
                                        </div>

                                        {/* Update Email button - orange gradient */}
                                        <button
                                            style={{ background: 'linear-gradient(102.89deg, #FF7D51 0%, #FF6C69 100%)' }}
                                            className="text-white px-7 py-3 rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
                                            onClick={handleUpdateEmail}
                                        >
                                            Update Email
                                        </button>

                                        <div className="mt-14 lg:mt-24 pt-6 text-center lg:text-left">
                                            <button className="text-[13px] font-bold text-gray-400 hover:text-gray-700 transition-colors underline tracking-wide">
                                                Sign out all devices
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}

                    {securityOpen && <hr className="border-gray-100 mb-8" />}

                    {/* SECTION 5: SUPPORT */}
                    <div className="mb-10">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Support</h2>
                        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                            {[
                                { label: 'Contact Support', path: '/support/contact' },
                                { label: 'Terms of service', path: '/support/terms' },
                                { label: 'Privacy Policy', path: '/support/privacy' }
                            ].map((item, i, arr) => (
                                <div key={item.label}
                                    onClick={() => router.push(item.path)}
                                    className={`px-6 py-4 text-[15px] font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-between
                    ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    {item.label}
                                    <ChevronRight size={18} className="text-gray-400" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="border-gray-100 mb-8" />

                    {/* SECTION 6: ACCOUNT DELETION (Danger Zone) */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Account</h2>

                        {/* Light red warning card */}
                        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3.5 mb-5 inline-block w-full">
                            <p className="text-[14px] font-semibold text-red-500">Deleting your account is permanent.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <button
                                onClick={() => setDeleteModalOpen(true)}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
                            >
                                <Trash2 size={16} />
                                Delete Account
                            </button>
                            <p className="text-[13px] font-medium text-gray-400">You'll need to enter your password to confirm.</p>
                        </div>
                    </div>
                </SettingsCard>

                <DeleteAccountModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={() => {
                        // Actual delete logic goes here
                        setDeleteModalOpen(false);
                    }}
                />
            </div>

            <Footer />
        </main>
    );
}

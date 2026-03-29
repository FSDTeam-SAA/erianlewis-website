import React from 'react';

interface SettingsCardProps {
    children: React.ReactNode;
}

export function SettingsCard({ children }: SettingsCardProps) {
    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 my-6 border border-gray-100">
            {children}
        </div>
    );
}

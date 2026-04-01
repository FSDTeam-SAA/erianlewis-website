export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="auth-shell flex flex-col">
            <div className="relative z-10 flex-1 flex flex-col">
                <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 md:px-6 md:py-16">
                    {children}
                </main>
            </div>
        </div>
    );
}

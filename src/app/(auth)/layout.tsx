export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="relative min-h-screen flex flex-col font-sans overflow-hidden"
            style={{ background: 'linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)' }}
        >
            <div className="relative z-10 flex-1 flex flex-col">
                <main className="flex-1 flex flex-col items-center justify-center p-4 py-16">
                    {children}
                </main>
            </div>
        </div>
    );
}

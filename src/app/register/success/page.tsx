import Link from "next/link";

export default function RegisterSuccessPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-[#f0d5c8] via-[#d9e8f0] to-[#c8dff0] flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-8 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900">Payment received</h1>
                <p className="text-sm text-gray-500 mt-4">
                    Your registration payment has been submitted. You can sign in as soon as the payment confirmation finishes.
                </p>
                <Link
                    href="/sign-in"
                    className="mt-8 inline-flex h-12 px-8 rounded-xl text-white font-semibold items-center justify-center"
                    style={{ background: "linear-gradient(90.99deg, #8BCCE6 2.49%, #F6855C 99.73%)" }}
                >
                    Go to sign in
                </Link>
            </div>
        </main>
    );
}

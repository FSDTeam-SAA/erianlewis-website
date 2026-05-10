import type { Metadata } from "next";
import { Suspense } from "react";
import { createMetadata } from "@/lib/seo";
import RegistrationSuccessClient from "./registration-success-client";

export const metadata: Metadata = createMetadata({
    title: "Registration Payment Received",
    description: "Your Alora registration payment has been received.",
    path: "/register/success",
    noIndex: true,
});

export default function RegisterSuccessPage() {
    return (
        <Suspense fallback={null}>
            <RegistrationSuccessClient />
        </Suspense>
    );
}

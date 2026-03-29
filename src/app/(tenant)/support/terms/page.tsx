import { SupportLayout } from "@/components/shared/SupportLayout";

const termsContent = [
    {
        id: 1,
        title: '1. Introduction',
        paragraphs: [
            'These Terms of Service govern access to and use of the Alora website, platform, and related services operated by Northgate Support Services LLC, a Wyoming limited liability company, United States.',
            'By accessing or using Alora, you agree to be bound by these Terms. If you do not agree, you must not use the platform.'
        ]
    },
    {
        id: 2,
        title: '2. Nature of the Platform',
        paragraphs: [
            'Alora is a software platform that allows users to browse, post, and manage property listings and inquiries. Alora is not a real estate broker, agent, property manager, escrow service, or transaction intermediary.',
            'Alora does not participate in negotiations, does not represent buyers or sellers, and does not facilitate or collect rent payments or real estate transaction funds.'
        ]
    },
    {
        id: 3,
        title: '3. Ownership and Control',
        paragraphs: [
            'Alora is owned and operated by Northgate Support Services LLC. All platform software, branding, design, and systems are the exclusive property of Northgate Support Services LLC.'
        ]
    },
    {
        id: 4,
        title: '4. Eligibility',
        paragraphs: [
            'You must be at least 18 years old to use Alora.',
            'The platform is available globally. Use of the platform is not authorized where prohibited by law.'
        ]
    },
    {
        id: 5,
        title: '5. User Accounts',
        paragraphs: [
            'Users may access Alora as guests or by creating an account.',
            'Account types include tenants, buyers, landlords, and agents. Landlord accounts may be designated as individual or business accounts. Business designation is used solely for platform analytics and operational features and does not constitute verification or endorsement.',
            'Account creation requires email verification. Only verified landlord or agent accounts may post listings.',
            'You are responsible for maintaining the accuracy and security of your account credentials.'
        ]
    },
    {
        id: 6,
        title: '6. Listings and Content',
        paragraphs: [
            'All property listings and related content are user generated.',
            'Alora does not verify listings, pricing, availability, ownership, or legal status of any property. Alora disclaims all responsibility for the accuracy, completeness, or legality of listings.',
            'Users may upload images. Uploading legal documents, identification, or sensitive personal records is prohibited.'
        ]
    },
    {
        id: 7,
        title: '7. Inquiries and Communications',
        paragraphs: [
            'Alora allows users to submit inquiries and appointment requests. Responses are delivered via email.',
            'Alora logs inquiries and initial responses only. Further communications between users outside the platform are not monitored and is not the responsibility of Alora.'
        ]
    },
    {
        id: 8,
        title: '8. Subscriptions and Payments',
        paragraphs: [
            'Alora offers paid subscription plans for platform access and features.',
            'All payments are processed through Stripe. Subscription fees are recurring unless otherwise stated.',
            'Alora does not collect rent, deposits, purchase funds, or transaction payments.'
        ]
    },
    {
        id: 9,
        title: '9. Platform Technology Disclosure',
        paragraphs: [
            'The Alora platform was built using the Anything AI platform. This disclosure is provided for transparency. Alora does not use artificial intelligence for property recommendations, pricing, analytics, or decision making.'
        ]
    },
    {
        id: 10,
        title: '10. Marketing Communications',
        paragraphs: [
            'By creating an account, you may receive marketing emails. You may opt out at any time.'
        ]
    }
];

export default function TermsOfServicePage() {
    return (
        <SupportLayout activeTab="terms">
            <div className="prose prose-sm max-w-none text-gray-700 text-[14px] leading-relaxed">
                <p className="font-extrabold text-gray-900 mb-1 tracking-tight text-[15px]">TERMS OF SERVICE</p>
                <p className="mb-0.5 font-bold text-gray-800">Alora Platform</p>
                <p className="mb-8 font-medium text-gray-500">Owned and Operated by Northgate Support Services LLC</p>

                {termsContent.map((section) => (
                    <div key={section.id} className="mb-8">
                        <p className="font-extrabold text-gray-900 mb-3 text-[15px]">{section.title}</p>
                        {section.paragraphs.map((p, i) => (
                            <p key={i} className="text-gray-600 mb-3 whitespace-pre-line font-medium leading-[1.6]">{p}</p>
                        ))}
                    </div>
                ))}
            </div>
        </SupportLayout>
    );
}

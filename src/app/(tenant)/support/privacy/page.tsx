import type { Metadata } from "next"
import { LegalDocumentPage } from "@/components/shared/LegalDocumentPage"
import { createMetadata } from "@/lib/seo"

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Review how Alora collects, uses, and protects platform and listing information.",
  path: "/support/privacy",
})

const privacyContent = [
    {
        id: 1,
        title: '1. Introduction',
        paragraphs: [
            'This Privacy Policy explains how Alora collects, uses, and protects information when you use the platform.'
        ]
    },
    {
        id: 2,
        title: '2. Information We Collect',
        paragraphs: [
            'We may collect:\n• Account information such as email and role type\n• Listing information submitted by users\n• Inquiry and appointment request data\n• Usage data and analytics\n• Cookies and tracking data',
            'We do not collect government identification, legal documents, or payment card information directly.'
        ]
    },
    {
        id: 3,
        title: '3. How We Use Information',
        paragraphs: [
            'Information is used to:\n• Operate and improve the platform\n• Enable listings and inquiries\n• Communicate platform related notices\n• Monitor performance and security'
        ]
    },
    {
        id: 4,
        title: '4. Analytics and Cookies',
        paragraphs: [
            'Alora uses cookies and analytics tools, including Google Analytics, to understand platform usage and improve services.',
            'You may disable cookies through your browser settings.'
        ]
    },
    {
        id: 5,
        title: '5. Communications',
        paragraphs: [
            'Alora logs inquiries and initial responses only. Further communications between users outside the platform are not tracked or controlled.'
        ]
    },
    {
        id: 6,
        title: '6. Payments',
        paragraphs: [
            'Payments are processed by Stripe. Alora does not store payment card data.'
        ]
    },
    {
        id: 7,
        title: '7. Data Sharing',
        paragraphs: [
            'We do not sell personal data. Information may be shared with service providers solely to operate the platform.'
        ]
    },
    {
        id: 8,
        title: '8. International Use',
        paragraphs: [
            'Alora is available globally. Users accessing the platform do so at their own initiative and are responsible for compliance with local laws.',
            'While the platform may be accessible in the European Union, Alora does not actively target EU residents and does not market services under EU data protection frameworks.'
        ]
    },
    {
        id: 9,
        title: '9. Data Security',
        paragraphs: [
            'We implement reasonable technical and organizational safeguards to protect data. No system is completely secure.'
        ]
    },
    {
        id: 10,
        title: '10. Account Termination',
        paragraphs: [
            'Upon account termination, data may be retained as required for legal, security, or operational purposes.'
        ]
    },
    {
        id: 11,
        title: '11. Changes to This Policy',
        paragraphs: [
            'This Privacy Policy may be updated. Continued use of the platform constitutes acceptance of changes.'
        ]
    },
    {
        id: 12,
        title: '12. Contact',
        paragraphs: [
            'Privacy and legal inquiries: support@northgate.services',
            'Platform support: info@alorarrealty.com'
        ]
    }
]

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      activeTab="privacy"
      section="privacyPolicy"
      title="Privacy Policy"
      fallbackContent={privacyContent}
    />
  )
}

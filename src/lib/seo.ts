import type { Metadata } from "next"

const fallbackSiteUrl = "https://alorarrealty.com"

export const siteConfig = {
  name: "Alora",
  legalName: "Alora by Northgate Support Services LLC",
  description:
    "Discover homes, rentals, and property listings with Alora.",
  tagline: "Homes, rentals, and property listings in one place with Alora.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl).replace(/\/$/, ""),
  locale: "en_US",
  keywords: [
    "Alora",
    "Alora real estate",
    "Alora rentals",
    "Alora homes for sale",
    "island properties",
    "rental listings",
    "property marketplace",
    "buy property with Alora",
    "rent property with Alora",
    "landlord property listings",
  ],
}

export const absoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return new URL(normalizedPath, siteConfig.url).toString()
}

type CreateMetadataInput = {
  title: string
  description: string
  path?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
}

export const createMetadata = ({
  title,
  description,
  path = "/",
  keywords = [],
  image = "/logo.png",
  noIndex = false,
}: CreateMetadataInput): Metadata => {
  const canonical = absoluteUrl(path)
  const socialImage = absoluteUrl(image)

  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: socialImage,
          width: 1000,
          height: 1000,
          alt: `${siteConfig.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  }
}

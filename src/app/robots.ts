import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/buy", "/buy/", "/rentals", "/rentals/", "/support/"],
        disallow: [
          "/account",
          "/dashboard",
          "/favorites",
          "/saved",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
          "/reset-password",
          "/verify-otp",
          "/onboarding",
          "/register/cancelled",
          "/register/success",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}

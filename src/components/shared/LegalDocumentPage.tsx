"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { SupportLayout } from "@/components/shared/SupportLayout"

type SupportTab = "terms" | "privacy"

type LegalDocumentSection = {
  id: number
  title: string
  paragraphs: string[]
}

type LegalDocumentData = {
  content?: string
  pdfUrl?: string
  inputType?: "text" | "pdf"
  isConfigured?: boolean
}

type LegalDocumentResponse = {
  status: boolean
  message: string
  data: LegalDocumentData | null
}

type LegalDocumentPageProps = {
  activeTab: SupportTab
  section: "termsOfService" | "privacyPolicy"
  title: string
  fallbackContent: LegalDocumentSection[]
}

const splitLegalContent = (content: string) =>
  content
    .split(/\n{2,}/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)

const hasHtmlContent = (content?: string) => /<\/?[a-z][\s\S]*>/i.test(content || "")

const sanitizeHtml = (html: string) => {
  if (typeof window === "undefined") return ""

  const documentBody = new DOMParser().parseFromString(html, "text/html").body
  documentBody.querySelectorAll("script, style, iframe, object, embed").forEach(element => element.remove())
  documentBody.querySelectorAll("*").forEach(element => {
    Array.from(element.attributes).forEach(attribute => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim().toLowerCase()

      if (name.startsWith("on") || value.startsWith("javascript:")) {
        element.removeAttribute(attribute.name)
      }
    })
  })

  return documentBody.innerHTML
}

function LegalDocumentSkeleton() {
  return (
    <div className="space-y-4 text-[11px] leading-5 text-[#4b5563] sm:text-[12px]">
      {Array.from({ length: 7 }).map((_, index) => (
        <section key={index} className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-[8px]" />
          <Skeleton className="h-4 w-full rounded-[8px]" />
          <Skeleton className="h-4 w-[92%] rounded-[8px]" />
          <Skeleton className="h-4 w-[78%] rounded-[8px]" />
        </section>
      ))}
    </div>
  )
}

export function LegalDocumentPage({
  activeTab,
  section,
  title,
  fallbackContent,
}: LegalDocumentPageProps) {
  const [documentData, setDocumentData] = useState<LegalDocumentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadDocument = async () => {
      setIsLoading(true)

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings/${section}`, {
          cache: "no-store",
        })

        const payload = (await response.json()) as LegalDocumentResponse

        if (!response.ok || !payload.status) {
          throw new Error(payload.message || `Failed to load ${title}`)
        }

        if (isMounted) {
          setDocumentData(payload.data)
        }
      } catch {
        if (isMounted) {
          setDocumentData(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDocument()

    return () => {
      isMounted = false
    }
  }, [section, title])

  const contentSections = useMemo<LegalDocumentSection[]>(() => {
    const content = documentData?.content?.trim()

    if (documentData?.isConfigured && content && !hasHtmlContent(content)) {
      return [
        {
          id: 1,
          title,
          paragraphs: splitLegalContent(content),
        },
      ]
    }

    return fallbackContent
  }, [documentData, fallbackContent, title])

  const pdfUrl = documentData?.isConfigured && documentData.inputType === "pdf" ? documentData.pdfUrl : ""
  const htmlContent = documentData?.isConfigured && hasHtmlContent(documentData.content)
    ? sanitizeHtml(documentData.content || "")
    : ""

  return (
    <SupportLayout activeTab={activeTab}>
      <div className="max-w-full overflow-hidden border border-[#eceef2] bg-white px-4 py-4 sm:px-5">
        <div className="mb-4 border-b border-[#eff1f4] pb-3">
          <p className="text-sm md:text-base font-semibold uppercase tracking-[0.12em] text-black leading-normal">{title}</p>
          <p className="text-sm md:text-base font-semibold uppercase tracking-[0.12em] text-black leading-normal">Alora Platform</p>
          <p className="text-sm md:text-base font-semibold uppercase tracking-[0.12em] text-black leading-normal">Owned and Operated by Northgate Support Services LLC</p>
        </div>

        {isLoading ? (
          <LegalDocumentSkeleton />
        ) : (
          <div className="max-w-full space-y-4 overflow-hidden text-[11px] leading-5 text-[#4b5563] sm:text-[12px]">
            {pdfUrl ? (
              <section className="space-y-1.5">
                <h2 className="text-sm md:text-base font-semibold uppercase tracking-[0.12em] text-black leading-normal ">
                  {title}
                </h2>
                <p className="whitespace-pre-line text-xs md:text-sm font-normal leading-normal text-black">
                  This document is available as a PDF.
                </p>
                <Link
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-xs md:text-sm font-semibold leading-normal text-black underline underline-offset-4"
                >
                  Open PDF
                </Link>
              </section>
            ) : htmlContent ? (
              <div
                className="max-w-full space-y-3 break-words text-xs font-normal leading-normal text-black [overflow-wrap:anywhere] [&_*]:max-w-full [&_*]:break-words [&_*]:[overflow-wrap:anywhere] [&_h1]:text-sm [&_h1]:font-semibold [&_h1]:uppercase [&_h1]:leading-normal [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:leading-normal [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:leading-normal [&_li]:ml-5 [&_li]:list-disc [&_p]:whitespace-normal [&_ul]:space-y-1 md:text-sm md:[&_h1]:text-base md:[&_h2]:text-base md:[&_h3]:text-base"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              contentSections.map(sectionItem => (
                <section key={sectionItem.id} className="space-y-1.5">
                  <h2 className="text-sm md:text-base font-semibold uppercase tracking-[0.12em] text-black leading-normal ">
                    {sectionItem.title}
                  </h2>
                  {sectionItem.paragraphs.map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line break-words text-xs font-normal leading-normal text-black [overflow-wrap:anywhere] md:text-sm">
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))
            )}

          </div>
        )}
      </div>
    </SupportLayout>
  )
}

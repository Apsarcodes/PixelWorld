import React from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'
import { BodyCustomCode, renderHeadCustomCode } from '@/lib/make-custom-code'
import { makeSiteSettings, sanitizeHtmlAttribute } from '@/lib/make-site-settings'
import './styles.css'

const defaultTitle = 'PixelWord — Location-Based Digital Advertising Marketplace'
const title = makeSiteSettings.title ?? defaultTitle
const description =
  makeSiteSettings.description ??
  'PixelWord is India\'s premier hyper-local digital advertising marketplace with live pixel canvas exploration and instant campaign booking across 8 Indian metros.'
const favicon = makeSiteSettings.icons?.icon
const socialImage = makeSiteSettings.openGraph?.image
const googleAnalyticsId = sanitizeHtmlAttribute(makeSiteSettings.analytics?.googleAnalyticsId)

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://pixelword.in'),
  title: {
    default: title,
    template: '%s | PixelWord',
  },
  description,
  keywords: [
    'PixelWord',
    'pixelword',
    'pixelword.in',
    'digital advertising',
    'interactive billboard',
    'pixel canvas',
    'hyperlocal advertising india',
    'billboard booking',
    'mumbai ads',
    'bangalore ads',
    'delhi ads',
    'chennai ads',
  ],
  alternates: {
    canonical: 'https://pixelword.in',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: favicon ? { icon: favicon } : undefined,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://pixelword.in',
    siteName: 'PixelWord',
    title,
    description,
    images: socialImage ? [{ url: socialImage, width: 1200, height: 630, alt: 'PixelWord Advertising' }] : undefined,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: socialImage ? [socialImage] : undefined,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const language = sanitizeHtmlAttribute(makeSiteSettings.language) || 'en'
  const addBypassLinks = makeSiteSettings.accessibility?.addBypassLinks === true
  const customScripts = makeSiteSettings.customScripts

  return (
    <html lang={language}>
      <head>
        {renderHeadCustomCode(customScripts?.headStart, 'head-start')}
        {renderHeadCustomCode(customScripts?.headEnd, 'head-end')}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'PixelWord',
              alternateName: ['pixelword', 'pixelword.in', 'PixelWord Advertising'],
              url: 'https://pixelword.in',
              description:
                'Hyper-local digital advertising marketplace with live pixel canvas exploration and instant campaign booking across 8 Indian metros.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://pixelword.in/?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-zinc-950 antialiased">
        <BodyCustomCode html={customScripts?.bodyStart} />
        {addBypassLinks && (
          <a className="figma-bypass-link" href="#root">
            Skip to content
          </a>
        )}
        <div id="root" tabIndex={-1}>
          {children}
        </div>
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="figma-google-analytics" strategy="afterInteractive">
              {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(googleAnalyticsId)});
`}
            </Script>
          </>
        )}
        <BodyCustomCode html={customScripts?.bodyEnd} />
      </body>
    </html>
  )
}

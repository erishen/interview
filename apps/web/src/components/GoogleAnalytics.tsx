'use client'

import Script from 'next/script'
import { Fragment, useEffect, useState } from 'react'

const GoogleAnalytics = () => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  // 检查是否启用分析功能
  if (!ENABLE_ANALYTICS) {
    return null
  }

  // 检查用户是否同意分析 cookie
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const consent = localStorage.getItem('cookie_consent')
      if (consent) {
        const parsed = JSON.parse(consent)
        setHasConsent(parsed.analytics)
      }
    } catch (error) {
      console.error('[Google Analytics] Error reading consent:', error)
    }
  }, [])

  // 如果没有配置 GA ID，不加载
  if (!GA_MEASUREMENT_ID) {
    console.warn('[Google Analytics] NEXT_PUBLIC_GA_MEASUREMENT_ID is not set')
    return null
  }

  // 如果用户未同意，不加载 GA（但保持组件存在以备后续启用）
  if (hasConsent === false) {
    return null
  }

  // 如果用户未决定，等待决定后再加载
  if (hasConsent === null) {
    return null
  }

  return (
    <Fragment>
      {/* Google Analytics gtag.js */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_location: window.location.href,
            send_page_view: true,
            // GDPR: 明确告诉 Google 已获得同意
            'anonymize_ip': true,
            'allow_google_signals': false,
          });
        `}
      </Script>
    </Fragment>
  )
}

export default GoogleAnalytics

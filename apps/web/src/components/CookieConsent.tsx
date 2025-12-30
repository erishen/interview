'use client'

import { useState, useEffect } from 'react'
import { Button } from '@interview/ui'
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics'

interface ConsentState {
  analytics: boolean
  marketing: boolean
  necessary: boolean
  hasDecided: boolean
}

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<ConsentState>({
    analytics: false,
    marketing: false,
    necessary: true,
    hasDecided: false,
  })

  // 检查是否启用分析功能
  const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'

  const { trackCustomEvent } = useGoogleAnalytics()

  // 如果未启用分析功能，不显示 Cookie 弹窗
  if (!ENABLE_ANALYTICS) {
    return null
  }

  // 组件挂载后读取 localStorage，避免 hydration 错误
  useEffect(() => {
    setMounted(true)

    try {
      const saved = localStorage.getItem('cookie_consent')
      if (saved) {
        const parsed = JSON.parse(saved)
        setConsent(parsed)
      }
    } catch (error) {
      console.error('Error reading cookie consent:', error)
    }
  }, [])

  // 如果用户已决定，更新 GA 状态
  useEffect(() => {
    if (mounted && consent.hasDecided) {
      if (consent.analytics) {
        // GoogleAnalytics 组件会自动处理
      } else {
        // 禁用 Google Analytics
        if (typeof window.gtag !== 'undefined') {
          window.gtag = () => {}
        }
      }
    }
  }, [mounted, consent.hasDecided, consent.analytics])

  // 保存同意状态
  const saveConsent = (newConsent: ConsentState) => {
    setConsent(newConsent)
    localStorage.setItem('cookie_consent', JSON.stringify(newConsent))
    
    // 记录用户选择
    trackCustomEvent('cookie_consent_decision', {
      analytics: newConsent.analytics,
      marketing: newConsent.marketing,
      consent_type: newConsent.hasDecided ? 'initial' : 'update',
    })
  }

  // 接受所有
  const acceptAll = () => {
    saveConsent({
      analytics: true,
      marketing: true,
      necessary: true,
      hasDecided: true,
    })
  }

  // 仅必要
  const acceptNecessary = () => {
    saveConsent({
      analytics: false,
      marketing: false,
      necessary: true,
      hasDecided: true,
    })
  }

  // 自定义选择
  const acceptCustom = (options: { analytics: boolean; marketing: boolean }) => {
    saveConsent({
      analytics: options.analytics,
      marketing: options.marketing,
      necessary: true,
      hasDecided: true,
    })
  }

  // 避免 hydration 错误：只在客户端挂载后才显示弹窗
  if (!mounted) {
    return null
  }

  if (consent.hasDecided) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* 左侧：说明 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-semibold">🍪 Cookie 设置</span>
              <span className="text-xs text-gray-500">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  {showDetails ? '收起详情' : '查看详情'}
                </button>
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              我们使用 cookie 来改善体验。您可以选择接受或拒绝特定类型的 cookie。
            </p>

            {/* 详细选项（可折叠） */}
            {showDetails && (
              <div className="space-y-2 text-xs mt-3 p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={consent.necessary}
                    disabled
                    className="w-4 h-4"
                  />
                  <div>
                    <strong className="block">必要 cookie</strong>
                    <span className="text-gray-500">网站必需</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) => setConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <div>
                    <strong className="block">分析 cookie</strong>
                    <span className="text-gray-500">改进产品</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={consent.marketing}
                    onChange={(e) => setConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <div>
                    <strong className="block">营销 cookie</strong>
                    <span className="text-gray-500">个性化推荐</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex gap-2 md:w-auto shrink-0">
            <Button
              onClick={acceptAll}
              className="px-4 py-1.5 text-sm h-9"
            >
              接受所有
            </Button>
            <Button
              onClick={acceptNecessary}
              variant="outline"
              className="px-4 py-1.5 text-sm h-9"
            >
              仅必要
            </Button>
            {showDetails && (
              <Button
                onClick={() => acceptCustom({ analytics: consent.analytics, marketing: consent.marketing })}
                variant="outline"
                className="px-4 py-1.5 text-sm h-9"
              >
                保存
              </Button>
            )}
          </div>
        </div>

        {/* 底部链接 */}
        <div className="mt-2 pt-2 border-t flex justify-between text-xs text-gray-500">
          <a href="/privacy" className="hover:text-blue-600">
            隐私政策
          </a>
          <a href="/terms" className="hover:text-blue-600">
            服务条款
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useCallback } from 'react'
import { useGoogleAnalytics } from './useGoogleAnalytics'

// 埋点事件类型
export type AnalyticsEventType =
  | 'product_view'        // 查看商品
  | 'product_detail'      // 查看商品详情
  | 'add_to_cart'         // 添加到购物车
  | 'remove_from_cart'    // 从购物车移除
  | 'update_quantity'     // 修改数量
  | 'cart_view'           // 查看购物车
  | 'checkout'            // 结算

interface AnalyticsEventData {
  productId?: number
  productName?: string
  price?: number
  category?: string
  quantity?: number
  cartTotal?: number
  cartCount?: number
  [key: string]: any
}

interface AnalyticsEvent {
  type: AnalyticsEventType
  data: AnalyticsEventData
  timestamp: number
  sessionId: string
  userId?: string
  url: string
  userAgent: string
  locale: string
}

// 获取或创建会话 ID
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

// 获取用户 ID（如果有）
function getUserId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.id || user.email
    }
  } catch (e) {
    // 忽略解析错误
  }
  return undefined
}

// 获取语言环境
function getLocale(): string {
  if (typeof window === 'undefined') return 'zh'
  
  try {
    const locale = localStorage.getItem('locale') || 'zh'
    return locale
  } catch (e) {
    return 'zh'
  }
}

export function useAnalytics() {
  const sessionId = getSessionId()
  const googleAnalytics = useGoogleAnalytics()

  const trackEvent = useCallback(async (
    type: AnalyticsEventType,
    data: AnalyticsEventData
  ) => {
    // 检查是否启用分析功能
    if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true') {
      return
    }

    if (typeof window === 'undefined') return

    // 检查用户是否同意分析 cookie
    try {
      const consent = localStorage.getItem('cookie_consent')
      if (consent) {
        const parsed = JSON.parse(consent)
        if (!parsed.analytics) {
          // 用户未同意分析，不发送自定义分析数据
          return
        }
      }
    } catch (error) {
      console.error('[Analytics] Error reading consent:', error)
    }

    const event: AnalyticsEvent = {
      type,
      data,
      timestamp: Date.now(),
      sessionId,
      userId: getUserId(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      locale: getLocale(),
    }

    try {
      // 发送埋点数据到后端
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        console.error('[Analytics] Failed to send event:', await response.text())
      }
    } catch (error) {
      console.error('[Analytics] Error sending event:', error)
      // 失败时不阻塞用户操作
    }
  }, [sessionId])

  const trackProductView = useCallback((product: { id: number; name: string; price: number; category?: string }) => {
    // 发送到自定义后端
    trackEvent('product_view', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
    })

    // 发送到 Google Analytics
    googleAnalytics.trackProductView(product)
  }, [trackEvent, googleAnalytics])

  const trackProductDetail = useCallback((product: { id: number; name: string; price: number; category?: string }) => {
    // 发送到自定义后端
    trackEvent('product_detail', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
    })

    // 发送到 Google Analytics
    googleAnalytics.trackProductDetail(product)
  }, [trackEvent, googleAnalytics])

  const trackAddToCart = useCallback((
    product: { id: number; name: string; price: number; category?: string },
    quantity: number = 1
  ) => {
    // 发送到自定义后端
    trackEvent('add_to_cart', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
      quantity,
    })

    // 发送到 Google Analytics
    googleAnalytics.trackAddToCart(product, quantity)
  }, [trackEvent, googleAnalytics])

  const trackRemoveFromCart = useCallback((
    product: { id: number; name: string; price: number },
    quantity: number
  ) => {
    // 发送到自定义后端
    trackEvent('remove_from_cart', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
    })

    // 发送到 Google Analytics
    googleAnalytics.trackRemoveFromCart(product, quantity)
  }, [trackEvent, googleAnalytics])

  const trackUpdateQuantity = useCallback((
    product: { id: number; name: string; price: number },
    oldQuantity: number,
    newQuantity: number
  ) => {
    // 发送到自定义后端
    trackEvent('update_quantity', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      oldQuantity,
      newQuantity,
    })

    // 发送到 Google Analytics
    googleAnalytics.trackUpdateQuantity(product, oldQuantity, newQuantity)
  }, [trackEvent, googleAnalytics])

  const trackCartView = useCallback((cartTotal: number, cartCount: number, items?: any[]) => {
    // 发送到自定义后端
    trackEvent('cart_view', {
      cartTotal,
      cartCount,
    })

    // 发送到 Google Analytics (需要 items 参数)
    if (items && items.length > 0) {
      googleAnalytics.trackCartView(cartTotal, cartCount, items)
    }
  }, [trackEvent, googleAnalytics])

  const trackCheckout = useCallback((cartTotal: number, cartCount: number, items: any[]) => {
    // 发送到自定义后端
    trackEvent('checkout', {
      cartTotal,
      cartCount,
      items: items.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })

    // 发送到 Google Analytics
    googleAnalytics.trackCheckout(cartTotal, cartCount, items)
  }, [trackEvent, googleAnalytics])

  return {
    trackEvent,
    trackProductView,
    trackProductDetail,
    trackAddToCart,
    trackRemoveFromCart,
    trackUpdateQuantity,
    trackCartView,
    trackCheckout,
  }
}

'use client'

// 声明全局 gtag 函数
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js',
      targetIdOrEventName: string,
      config?: Record<string, any>
    ) => void
    dataLayer: any[]
  }
}

/**
 * Google Analytics 4 (GA4) Hook
 * 用于发送事件到 Google Analytics
 */
export function useGoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  // 检查 gtag 是否可用
  const isGaAvailable = (): boolean => {
    return typeof window !== 'undefined' && typeof window.gtag === 'function'
  }

  /**
   * 发送自定义事件到 GA
   */
  const sendEvent = (eventName: string, eventParams: Record<string, any>) => {
    if (!GA_MEASUREMENT_ID) {
      console.warn('[Google Analytics] Measurement ID not configured')
      return
    }

    if (!isGaAvailable()) {
      console.warn('[Google Analytics] gtag not available')
      return
    }

    try {
      window.gtag('event', eventName, {
        ...eventParams,
        send_to: GA_MEASUREMENT_ID,
      })
    } catch (error) {
      console.error('[Google Analytics] Error sending event:', error)
    }
  }

  /**
   * 页面浏览事件
   */
  const trackPageView = (url?: string) => {
    if (!isGaAvailable()) return

    window.gtag('config', GA_MEASUREMENT_ID!, {
      page_location: url || window.location.href,
      page_title: document.title,
    })
  }

  /**
   * 商品浏览事件 (GA4 view_item)
   */
  const trackProductView = (product: {
    id: number
    name: string
    price: number
    category?: string
  }) => {
    sendEvent('view_item', {
      currency: 'CNY',
      value: product.price,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          price: product.price,
          quantity: 1,
        },
      ],
    })
  }

  /**
   * 商品详情事件 (GA4 view_item)
   */
  const trackProductDetail = (product: {
    id: number
    name: string
    price: number
    category?: string
  }) => {
    sendEvent('view_item', {
      currency: 'CNY',
      value: product.price,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: 1,
        },
      ],
    })
  }

  /**
   * 添加到购物车事件 (GA4 add_to_cart)
   */
  const trackAddToCart = (
    product: {
      id: number
      name: string
      price: number
      category?: string
    },
    quantity: number = 1
  ) => {
    sendEvent('add_to_cart', {
      currency: 'CNY',
      value: product.price * quantity,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: quantity,
        },
      ],
    })
  }

  /**
   * 从购物车移除事件 (GA4 remove_from_cart)
   */
  const trackRemoveFromCart = (
    product: {
      id: number
      name: string
      price: number
    },
    quantity: number
  ) => {
    sendEvent('remove_from_cart', {
      currency: 'CNY',
      value: product.price * quantity,
      items: [
        {
          item_id: String(product.id),
          item_name: product.name,
          price: product.price,
          quantity: quantity,
        },
      ],
    })
  }

  /**
   * 修改数量事件
   */
  const trackUpdateQuantity = (
    product: {
      id: number
      name: string
      price: number
    },
    oldQuantity: number,
    newQuantity: number
  ) => {
    if (newQuantity > oldQuantity) {
      // 增加数量，使用 add_to_cart
      const addedQuantity = newQuantity - oldQuantity
      sendEvent('add_to_cart', {
        currency: 'CNY',
        value: product.price * addedQuantity,
        items: [
          {
            item_id: String(product.id),
            item_name: product.name,
            price: product.price,
            quantity: addedQuantity,
          },
        ],
      })
    } else if (newQuantity < oldQuantity) {
      // 减少数量，使用 remove_from_cart
      const removedQuantity = oldQuantity - newQuantity
      sendEvent('remove_from_cart', {
        currency: 'CNY',
        value: product.price * removedQuantity,
        items: [
          {
            item_id: String(product.id),
            item_name: product.name,
            price: product.price,
            quantity: removedQuantity,
          },
        ],
      })
    }
  }

  /**
   * 查看购物车事件 (GA4 view_cart)
   */
  const trackCartView = (cartTotal: number, _cartCount: number, items: any[]) => {
    sendEvent('view_cart', {
      currency: 'CNY',
      value: cartTotal,
      items: items.map((item) => ({
        item_id: String(item.id),
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })
  }

  /**
   * 开始结账事件 (GA4 begin_checkout)
   */
  const trackCheckout = (
    cartTotal: number,
    _cartCount: number,
    items: any[]
  ) => {
    sendEvent('begin_checkout', {
      currency: 'CNY',
      value: cartTotal,
      items: items.map((item) => ({
        item_id: String(item.id),
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    })
  }

  /**
   * 自定义事件
   */
  const trackCustomEvent = (eventName: string, eventParams: Record<string, any>) => {
    sendEvent(eventName, eventParams)
  }

  return {
    trackPageView,
    trackProductView,
    trackProductDetail,
    trackAddToCart,
    trackRemoveFromCart,
    trackUpdateQuantity,
    trackCartView,
    trackCheckout,
    trackCustomEvent,
    isAvailable: isGaAvailable(),
  }
}

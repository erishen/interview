/* eslint-disable */
import 'next'
import '@types/node'

// 扩展 Window 接口以支持 Google Analytics gtag
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void
  }
}

export {}

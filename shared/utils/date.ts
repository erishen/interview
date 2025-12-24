/**
 * 通用日期处理工具函数
 */

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return dateObj.toLocaleDateString("en-US", { ...defaultOptions, ...options })
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(dateObj)
}

export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null
  const date = new Date(dateString)
  return isValidDate(date) ? date : null
}

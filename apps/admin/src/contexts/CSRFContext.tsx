'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useCSRF } from '@/hooks/useCSRF'

interface CSRFContextType {
  csrfToken: string
  loading: boolean
  error: string | null
  refreshToken: () => void
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined)

export function CSRFProvider({ children }: { children: ReactNode }) {
  const csrf = useCSRF()

  return (
    <CSRFContext.Provider value={csrf}>
      {children}
    </CSRFContext.Provider>
  )
}

export function useCSRFContext() {
  const context = useContext(CSRFContext)
  if (context === undefined) {
    throw new Error('useCSRFContext must be used within a CSRFProvider')
  }
  return context
}
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  notify: (message: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => dismiss(id), 5000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toasts, notify, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

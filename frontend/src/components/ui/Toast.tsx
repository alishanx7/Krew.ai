import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../lib/utils'

export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right',
            toast.type === 'success' && 'border-emerald-500/20 bg-emerald-500/10',
            toast.type === 'error' && 'border-red-500/20 bg-red-500/10',
            toast.type === 'info' && 'border-krew-500/20 bg-krew-500/10',
          )}
        >
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-krew-400 shrink-0" />}
          <p className="text-sm text-white">{toast.message}</p>
          <button onClick={() => dismiss(toast.id)} className="ml-2 text-zinc-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

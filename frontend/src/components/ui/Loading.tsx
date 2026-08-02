import { cn } from '../../lib/utils'

export function LoadingSpinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('relative', sizes[size])}>
        <div className="absolute inset-0 rounded-full border-2 border-krew-500/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-krew-500" />
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-zinc-400 animate-pulse">Loading...</p>
    </div>
  )
}

export function AgentLoader({ agentName }: { agentName: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-krew-500/20 bg-krew-500/5 px-4 py-3">
      <LoadingSpinner size="sm" />
      <div>
        <p className="text-sm font-medium text-krew-300">{agentName}</p>
        <p className="text-xs text-zinc-500">Analyzing your business context...</p>
      </div>
    </div>
  )
}

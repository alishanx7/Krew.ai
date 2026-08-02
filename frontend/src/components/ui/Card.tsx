import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export function Card({ children, className, hover, glow }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-xl',
        hover && 'transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]',
        glow && 'shadow-lg shadow-krew-500/5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-6 pb-2', className)}>{children}</div>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-semibold text-white', className)}>{children}</h3>
}

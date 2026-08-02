import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-krew-600 to-krew-500 hover:from-krew-500 hover:to-krew-400 text-white shadow-lg shadow-krew-500/25',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
    ghost: 'hover:bg-white/5 text-zinc-300 hover:text-white',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {children}
    </button>
  )
}

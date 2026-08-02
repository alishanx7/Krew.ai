import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-zinc-300">{label}</label>}
      <input
        className={cn(
          'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white',
          'placeholder:text-zinc-500 focus:border-krew-500/50 focus:outline-none focus:ring-2 focus:ring-krew-500/20',
          'transition-all duration-200',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-zinc-300">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white',
          'placeholder:text-zinc-500 focus:border-krew-500/50 focus:outline-none focus:ring-2 focus:ring-krew-500/20',
          'transition-all duration-200 resize-none',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-zinc-300">{label}</label>}
      <select
        className={cn(
          'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white',
          'focus:border-krew-500/50 focus:outline-none focus:ring-2 focus:ring-krew-500/20',
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-raised">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

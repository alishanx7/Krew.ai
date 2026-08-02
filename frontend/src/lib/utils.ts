export function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'text-emerald-400 bg-emerald-400/10'
    case 'running':
    case 'generating':
    case 'in_progress': return 'text-krew-400 bg-krew-400/10'
    case 'failed': return 'text-red-400 bg-red-400/10'
    default: return 'text-zinc-400 bg-zinc-400/10'
  }
}

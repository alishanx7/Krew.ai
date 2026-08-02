import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import { cn, getStatusColor } from '../../lib/utils'
import type { AgentRun } from '../../types'

interface AgentWorkflowProps {
  agents: AgentRun[]
  streamingOutput?: Record<string, string>
}

export function AgentWorkflow({ agents, streamingOutput = {} }: AgentWorkflowProps) {
  const sorted = [...agents].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-2 w-2 rounded-full bg-krew-500 animate-pulse" />
        <span className="text-sm font-medium text-krew-300">Orchestrator coordinating agents</span>
      </div>
      {sorted.map((agent, i) => (
        <div
          key={agent.id}
          className={cn(
            'relative rounded-xl border p-4 transition-all duration-500',
            agent.status === 'running' && 'border-krew-500/30 bg-krew-500/5',
            agent.status === 'completed' && 'border-emerald-500/20 bg-emerald-500/5',
            agent.status === 'waiting' && 'border-white/5 bg-white/[0.02]',
            agent.status === 'failed' && 'border-red-500/20 bg-red-500/5',
          )}
        >
          {i < sorted.length - 1 && (
            <div className="absolute left-7 top-full h-3 w-px bg-white/10" />
          )}
          <div className="flex items-center gap-3">
            <StatusIcon status={agent.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{agent.agent_name}</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', getStatusColor(agent.status))}>
                  {agent.status}
                </span>
              </div>
              {(streamingOutput[agent.agent_key] || agent.output) && (
                <p className="mt-2 text-xs text-zinc-400 line-clamp-2 font-mono">
                  {(streamingOutput[agent.agent_key] || agent.output)?.slice(0, 200)}...
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
    case 'running':
      return <Loader2 className="h-5 w-5 text-krew-400 animate-spin shrink-0" />
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-400 shrink-0" />
    default:
      return <Circle className="h-5 w-5 text-zinc-600 shrink-0" />
  }
}

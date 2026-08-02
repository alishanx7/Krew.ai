import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, RefreshCw, Sparkles } from 'lucide-react'
import { AppLayout } from '../components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Loading'
import { AgentWorkflow } from '../components/agents/AgentWorkflow'
import { ExecutiveDashboard } from '../components/reports/ExecutiveDashboard'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api, API_URL } from '../lib/api'
import type { AgentRun, ProjectDetail, StreamEvent } from '../types'
import { getStatusColor } from '../lib/utils'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const { notify } = useToast()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [agents, setAgents] = useState<AgentRun[]>([])
  const [streamingOutput, setStreamingOutput] = useState<Record<string, string>>({})

  const loadProject = useCallback(async () => {
    if (!token || !id) return
    const data = await api.projects.get(id, token)
    setProject(data)
    setAgents(data.agent_runs)
  }, [token, id])

  useEffect(() => {
    loadProject().finally(() => setLoading(false))
  }, [loadProject])

  const startGeneration = async () => {
    if (!token || !id) return
    setGenerating(true)
    setStreamingOutput({})
    setAgents((a) => a.map((x) => ({ ...x, status: 'waiting' as const, output: undefined })))

    try {
      await api.agents.generate(id, token)

      const response = await fetch(`${API_URL}/api/agents/projects/${id}/stream`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Stream failed')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader')

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event: StreamEvent = JSON.parse(line.slice(6))
            handleStreamEvent(event)
          } catch { /* skip malformed */ }
        }
      }

      await loadProject()
      notify('Strategy report generated!', 'success')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Generation failed', 'error')
      await loadProject()
    } finally {
      setGenerating(false)
    }
  }

  const handleStreamEvent = (event: StreamEvent) => {
    if (event.type === 'agent_status' && event.agent_key && event.status) {
      setAgents((prev) =>
        prev.map((a) =>
          a.agent_key === event.agent_key
            ? { ...a, status: event.status as AgentRun['status'] }
            : a,
        ),
      )
    }
    if (event.type === 'agent_chunk' && event.agent_key && event.chunk) {
      setStreamingOutput((prev) => ({
        ...prev,
        [event.agent_key!]: (prev[event.agent_key!] || '') + event.chunk,
      }))
    }
    if (event.type === 'workflow_error') {
      notify(event.error || 'Workflow failed', 'error')
    }
  }

  const exportPdf = async () => {
    if (!token || !id) return
    try {
      const res = await api.agents.exportPdf(id, token)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `krew-ai-report.pdf`
      a.click()
      URL.revokeObjectURL(url)
      notify('PDF exported!', 'success')
    } catch {
      notify('Export failed', 'error')
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>
  if (!project) return <AppLayout><p className="text-zinc-400">Project not found</p></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{project.business_name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <p className="mt-1 text-zinc-400">{project.industry} · Budget: {project.budget} · Deadline: {project.deadline}</p>
          </div>
          <div className="flex gap-2">
            {project.report && (
              <Button variant="secondary" onClick={exportPdf}>
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            )}
            <Button onClick={startGeneration} loading={generating} disabled={generating}>
              {generating ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Strategy</>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle>Agent Workflow</CardTitle></CardHeader>
              <CardContent>
                <AgentWorkflow agents={agents} streamingOutput={streamingOutput} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Project Brief</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-zinc-500 mb-1">Problem Statement</p>
                  <p className="text-zinc-300">{project.problem_statement}</p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1">Goals</p>
                  <p className="text-zinc-300">{project.goals}</p>
                </div>
              </CardContent>
            </Card>

            {project.report && <ExecutiveDashboard report={project.report} />}

            {!project.report && !generating && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Sparkles className="mx-auto h-12 w-12 text-krew-500/50 mb-4" />
                  <p className="text-zinc-400">Click "Generate Strategy" to deploy AI agents</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

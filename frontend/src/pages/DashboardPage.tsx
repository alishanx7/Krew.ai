import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FolderKanban, Bot, FileText, TrendingUp } from 'lucide-react'
import { AppLayout } from '../components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Loading'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type { DashboardStats, Project } from '../types'
import { formatDate, getStatusColor } from '../lib/utils'

export default function DashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([api.projects.stats(token), api.projects.list(token)])
      .then(([s, p]) => { setStats(s); setProjects(p.slice(0, 5)) })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  const statCards = [
    { label: 'Total Projects', value: stats?.total_projects ?? 0, icon: FolderKanban, color: 'text-krew-400' },
    { label: 'Completed', value: stats?.completed_projects ?? 0, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Active Agents', value: stats?.active_agents ?? 0, icon: Bot, color: 'text-amber-400' },
    { label: 'Documents', value: stats?.total_documents ?? 0, icon: FileText, color: 'text-blue-400' },
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-zinc-400">Your AI-powered business intelligence hub</p>
          </div>
          <Link to="/projects/new">
            <Button size="lg">
              New Project <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card hover glow>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Projects</CardTitle>
            <Link to="/projects" className="text-sm text-krew-400 hover:text-krew-300">View all</Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                <p className="text-zinc-400">No projects yet. Create your first strategy project.</p>
                <Link to="/projects/new" className="inline-block mt-4">
                  <Button>Create Project</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-white">{p.business_name}</p>
                      <p className="text-sm text-zinc-500">{p.industry} · {formatDate(p.created_at)}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

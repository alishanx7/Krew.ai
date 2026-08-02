import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { AppLayout } from '../components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { PageLoader } from '../components/ui/Loading'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import type { Project, ProjectDetail } from '../types'
import { formatDate, getStatusColor } from '../lib/utils'

export default function ReportsPage() {
  const { token } = useAuth()
  const [reports, setReports] = useState<(Project & { report?: ProjectDetail['report'] })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api.projects.list(token).then(async (projects) => {
      const withReports = await Promise.all(
        projects
          .filter((p) => p.status === 'completed')
          .map(async (p) => {
            const detail = await api.projects.get(p.id, token)
            return { ...p, report: detail.report }
          }),
      )
      setReports(withReports)
    }).finally(() => setLoading(false))
  }, [token])

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-zinc-400">Executive strategy reports from completed projects</p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No completed reports yet. Generate a strategy to see reports here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`}>
                <Card hover>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{p.business_name}</CardTitle>
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${getStatusColor(p.status)}`}>{p.status}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-400 line-clamp-2">{p.report?.executive_summary || 'No summary available'}</p>
                    <div className="flex gap-4 mt-3">
                      {p.report?.scores && Object.entries(p.report.scores).map(([key, val]) => (
                        <div key={key} className="text-center">
                          <p className="text-lg font-bold text-white">{val}</p>
                          <p className="text-xs text-zinc-500 capitalize">{key}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-600 mt-3">{formatDate(p.created_at)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

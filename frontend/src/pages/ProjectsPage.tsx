import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { AppLayout } from '../components/layout/Sidebar'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Loading'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import type { Project } from '../types'
import { formatDate, getStatusColor } from '../lib/utils'

export default function ProjectsPage() {
  const { token } = useAuth()
  const { notify } = useToast()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    api.projects.list(token).then(setProjects).finally(() => setLoading(false))
  }, [token])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token || !confirm('Delete this project?')) return
    try {
      await api.projects.delete(id, token)
      setProjects((p) => p.filter((x) => x.id !== id))
      notify('Project deleted', 'success')
    } catch {
      notify('Failed to delete project', 'error')
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="mt-1 text-zinc-400">Manage your business strategy projects</p>
          </div>
          <Link to="/projects/new">
            <Button><Plus className="h-4 w-4" /> New Project</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-zinc-400 mb-4">No projects yet</p>
              <Link to="/projects/new"><Button>Create your first project</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`}>
                <Card hover className="group">
                  <CardContent className="py-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-krew-300 transition-colors">{p.business_name}</h3>
                      <p className="text-sm text-zinc-400 mt-1">{p.industry} · Budget: {p.budget} · {formatDate(p.created_at)}</p>
                      <p className="text-sm text-zinc-500 mt-2 line-clamp-1">{p.problem_statement}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${getStatusColor(p.status)}`}>{p.status}</span>
                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Sparkles } from 'lucide-react'
import { AppLayout } from '../components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api, ApiError } from '../lib/api'

const industries = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
  'Real Estate', 'Manufacturing', 'Consulting', 'Media', 'Other',
].map((i) => ({ value: i, label: i }))

export default function NewProjectPage() {
  const { token } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [form, setForm] = useState({
    business_name: '',
    industry: 'Technology',
    problem_statement: '',
    goals: '',
    budget: '',
    deadline: '',
  })

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    try {
      const project = await api.projects.create(form, token)
      for (const file of files) {
        await api.documents.upload(file, token, project.id)
      }
      notify('Project created!', 'success')
      navigate(`/projects/${project.id}`)
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Failed to create project', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">New Project</h1>
          <p className="mt-1 text-zinc-400">Tell us about your business challenge</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card glow>
            <CardHeader><CardTitle>Business Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input label="Business Name" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} placeholder="Acme Corp" required />
              <Select label="Industry" options={industries} value={form.industry} onChange={(e) => update('industry', e.target.value)} />
              <Textarea label="Problem Statement" value={form.problem_statement} onChange={(e) => update('problem_statement', e.target.value)} placeholder="Describe the business problem you're trying to solve..." rows={4} required />
              <Textarea label="Goals" value={form.goals} onChange={(e) => update('goals', e.target.value)} placeholder="What do you want to achieve?" rows={3} required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Budget" value={form.budget} onChange={(e) => update('budget', e.target.value)} placeholder="$50,000 - $100,000" required />
                <Input label="Deadline" value={form.deadline} onChange={(e) => update('deadline', e.target.value)} placeholder="Q4 2026" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Supporting Documents (Optional)</CardTitle></CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 cursor-pointer hover:border-krew-500/30 hover:bg-krew-500/5 transition-all">
                <Upload className="h-8 w-8 text-zinc-500 mb-3" />
                <p className="text-sm text-zinc-400">Drop PDF, Word, or text files here</p>
                <p className="text-xs text-zinc-600 mt-1">Max 25MB per file</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </label>
              {files.length > 0 && (
                <div className="mt-3 space-y-1">
                  {files.map((f) => (
                    <p key={f.name} className="text-sm text-zinc-400">📄 {f.name}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            <Sparkles className="h-5 w-5" /> Create Project
          </Button>
        </form>
      </div>
    </AppLayout>
  )
}

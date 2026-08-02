import { useEffect, useState } from 'react'
import { Upload, Trash2, FileText } from 'lucide-react'
import { AppLayout } from '../components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Loading'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'
import type { Document } from '../types'
import { formatDate, formatBytes } from '../lib/utils'

export default function DocumentsPage() {
  const { token } = useAuth()
  const { notify } = useToast()
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const load = () => {
    if (!token) return
    api.documents.list(token).then(setDocs).finally(() => setLoading(false))
  }

  useEffect(load, [token])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setUploading(true)
    try {
      const doc = await api.documents.upload(file, token)
      setDocs((d) => [doc, ...d])
      notify('Document uploaded and processed', 'success')
    } catch {
      notify('Upload failed', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this document?')) return
    try {
      await api.documents.delete(id, token)
      setDocs((d) => d.filter((x) => x.id !== id))
      notify('Document deleted', 'success')
    } catch {
      notify('Delete failed', 'error')
    }
  }

  if (loading) return <AppLayout><PageLoader /></AppLayout>

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Documents</h1>
            <p className="mt-1 text-zinc-400">Upload PDF, Word, or text files for AI context</p>
          </div>
          <label className="cursor-pointer">
            <span className="inline-flex">
              <Button loading={uploading}>
                <Upload className="h-4 w-4" /> Upload
              </Button>
            </span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.md" onChange={handleUpload} />
          </label>
        </div>

        {docs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400">No documents uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {docs.map((doc) => (
              <Card key={doc.id} hover>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-krew-400" />
                    <div>
                      <p className="font-medium text-white">{doc.filename}</p>
                      <p className="text-sm text-zinc-500">{doc.file_type.toUpperCase()} · {formatBytes(doc.file_size)} · {formatDate(doc.created_at)}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-400/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

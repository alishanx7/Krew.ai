import { useState } from 'react'
import { User, Key, Palette } from 'lucide-react'
import { AppLayout } from '../components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

export default function SettingsPage() {
  const { user, token, refreshUser } = useAuth()
  const { notify } = useToast()
  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    company: user?.company || '',
    role: user?.role || '',
  })
  const [apiKey, setApiKey] = useState('')
  const [theme, setTheme] = useState(user?.theme || 'dark')
  const [saving, setSaving] = useState(false)

  const saveProfile = async () => {
    if (!token) return
    setSaving(true)
    try {
      await api.settings.updateProfile(profile, token)
      await refreshUser()
      notify('Profile updated', 'success')
    } catch {
      notify('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveApiKey = async () => {
    if (!token) return
    setSaving(true)
    try {
      await api.settings.updateApiKey(apiKey || null, token)
      setApiKey('')
      notify('API key saved', 'success')
    } catch {
      notify('Failed to save API key', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    if (token) {
      await api.settings.updateProfile({ theme: newTheme }, token)
      await refreshUser()
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-zinc-400">Manage your account and preferences</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-krew-400" />
              <CardTitle>Account Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Full Name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            <Input label="Company" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
            <Input label="Role" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
            <Input label="Email" value={user?.email || ''} disabled />
            <Button onClick={saveProfile} loading={saving}>Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-krew-400" />
              <CardTitle>API Key Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-400">Add your Fireworks AI API key for live LLM responses. Without a key, demo mode is used.</p>
            <Input label="Fireworks API Key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="fw_..." />
            <Button onClick={saveApiKey} loading={saving}>Save API Key</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-krew-400" />
              <CardTitle>Theme</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-sm text-zinc-400">Toggle between dark and light themes</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative h-7 w-12 rounded-full transition-colors ${theme === 'dark' ? 'bg-krew-500' : 'bg-zinc-600'}`}
              >
                <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

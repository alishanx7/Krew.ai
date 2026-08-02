import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ApiError } from '../lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      notify('Welcome back!', 'success')
      navigate('/dashboard')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-krew-900/30 via-surface to-surface" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-krew-500 to-krew-700 shadow-xl shadow-krew-500/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to Krew AI</h1>
          <p className="mt-2 text-zinc-400">Sign in to your multi-agent workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 backdrop-blur-xl space-y-5">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
          <p className="text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-krew-400 hover:text-krew-300 font-medium">Create one</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}

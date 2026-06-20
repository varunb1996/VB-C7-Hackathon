import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { Card, Input, Button, Alert } from '../components/ui'

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/register', new URLSearchParams(form))
      const res = await api.post('/login', new URLSearchParams(form))
      onLogin(res.data.user)
      navigate('/features')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Create an account</h1>
        <p className="text-zinc-500 text-sm mt-1">Start evaluating your AI features</p>
      </div>
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input label="Email" type="email" required autoFocus placeholder="you@example.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Password" type="password" required placeholder="••••••••"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          {error && <Alert>{error}</Alert>}
          <Button variant="primary" className="w-full justify-center mt-1" loading={loading}>
            Create account
          </Button>
        </form>
        <div className="border-t border-zinc-800 mt-5 pt-4 text-center">
          <p className="text-xs text-zinc-500">Already have an account? <Link to="/login" className="text-violet-400 hover:text-violet-300">Login</Link></p>
        </div>
      </Card>
    </div>
  )
}

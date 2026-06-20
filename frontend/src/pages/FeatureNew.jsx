import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { Card, Input, Textarea, Button, Alert } from '../components/ui'

export default function FeatureNew() {
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await api.post('/features', form)
      navigate(`/features/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create feature')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Link to="/features" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-6">← Back to features</Link>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">New Feature</h1>
        <p className="text-zinc-500 text-sm mt-1">Describe the AI feature you want to evaluate.</p>
      </div>
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input label="Feature name" required autoFocus placeholder="e.g. Support ticket summariser"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Textarea label="What does it do?" placeholder="e.g. Takes a raw support ticket and returns a 2-sentence summary of the issue and the requested resolution."
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          {error && <Alert>{error}</Alert>}
          <div className="flex gap-3 mt-1">
            <Button variant="primary" loading={loading}>Create feature →</Button>
            <Link to="/features"><Button variant="ghost" type="button">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

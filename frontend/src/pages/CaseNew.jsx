import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { Card, Input, Textarea, Button, Alert } from '../components/ui'

export default function CaseNew() {
  const { id } = useParams()
  const [form, setForm] = useState({ input: '', expected_output: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(0)
  const navigate = useNavigate()

  function set(k) {
    return e => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function submit(e, andAnother = false) {
    e.preventDefault()
    if (!form.input.trim() || !form.expected_output.trim()) {
      setError('Both fields are required'); return
    }
    setLoading(true); setError('')
    try {
      await api.post(`/features/${id}/cases`, form)
      if (andAnother) {
        setSaved(s => s + 1)
        setForm({ input: '', expected_output: '' })
      } else {
        navigate(`/features/${id}`)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save case')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Link to={`/features/${id}`} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-6">
        ← Back to feature
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Add Golden Case</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Write the input and what a <strong className="text-zinc-300">good output looks like</strong> — decided before the model runs.
        </p>
      </div>

      {saved > 0 && (
        <div className="mb-4 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 rounded-lg px-4 py-2.5 text-sm">
          ✓ {saved} case{saved > 1 ? 's' : ''} saved. Add another below.
        </div>
      )}

      <Card>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Textarea
            label="Input"
            placeholder="The exact input your AI feature receives..."
            value={form.input}
            onChange={set('input')}
          />
          <Textarea
            label="Expected output (the golden answer)"
            placeholder="What a good output looks like — be specific enough to grade against..."
            value={form.expected_output}
            onChange={set('expected_output')}
          />
          {error && <Alert>{error}</Alert>}
          <div className="flex gap-3 mt-1">
            <Button variant="primary" loading={loading}>Save & finish</Button>
            <Button
              variant="secondary"
              type="button"
              loading={loading}
              onClick={e => submit(e, true)}
            >
              Save & add another
            </Button>
            <Link to={`/features/${id}`}>
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

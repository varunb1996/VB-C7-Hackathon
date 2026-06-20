import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { Card, Textarea, Button, Alert, Spinner } from '../components/ui'

export default function RunNew() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [outputs, setOutputs] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/features/${id}`).then(r => {
      setData(r.data)
      const initial = {}
      r.data.cases.forEach(c => { initial[c.id] = '' })
      setOutputs(initial)
    })
  }, [id])

  async function submit(e) {
    e.preventDefault()
    const missing = data.cases.filter(c => !outputs[c.id]?.trim())
    if (missing.length > 0) { setError(`Fill in actual output for all ${data.cases.length} cases`); return }
    setLoading(true); setError('')
    try {
      const res = await api.post(`/features/${id}/run`, {
        actual_outputs: outputs
      })
      navigate(`/runs/${res.data.run_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Run failed')
    } finally {
      setLoading(false)
    }
  }

  if (!data) return <div className="flex justify-center pt-20"><Spinner size={24} /></div>

  return (
    <div>
      <Link to={`/features/${id}`} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-6">
        ← Back to feature
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Run Eval — {data.feature.name}</h1>
        <p className="text-zinc-500 text-sm mt-1">
          For each case, paste the <strong className="text-zinc-300">actual output your AI feature produced</strong>. The grader will score it against the expected output using the rubric.
        </p>
      </div>

      <form onSubmit={submit}>
        <div className="flex flex-col gap-4 mb-6">
          {data.cases.map((c, i) => (
            <Card key={c.id}>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Case #{i + 1}</div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-zinc-500 mb-1.5">Input</div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-300 whitespace-pre-wrap min-h-16">{c.input}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1.5">Expected output (golden)</div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-xs text-zinc-300 whitespace-pre-wrap min-h-16">{c.expected_output}</div>
                </div>
              </div>
              <Textarea
                label="Actual output from your AI feature"
                placeholder="Paste what your AI feature actually produced for this input..."
                value={outputs[c.id] || ''}
                onChange={e => setOutputs(o => ({ ...o, [c.id]: e.target.value }))}
              />
            </Card>
          ))}
        </div>

        {error && <Alert className="mb-4">{error}</Alert>}

        <div className="flex gap-3">
          <Button variant="primary" size="lg" loading={loading}>
            ▶ Grade all {data.cases.length} cases
          </Button>
          <Link to={`/features/${id}`}><Button variant="ghost" size="lg" type="button">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}

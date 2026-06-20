import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api'
import { Card, Textarea, Button, Alert } from '../components/ui'

const PLACEHOLDER = `Grade on the following dimensions:

1. Accuracy — Does the output correctly address the input? (pass/fail)
2. Completeness — Does it cover all key points? (pass/fail)
3. Conciseness — Is it free of irrelevant content? (pass/fail)

Overall: pass only if all three dimensions pass.`

export default function RubricEdit() {
  const { id } = useParams()
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/features/${id}`).then(r => {
      if (r.data.rubric) setText(r.data.rubric.dimensions_text)
    })
  }, [id])

  async function submit(e) {
    e.preventDefault()
    if (!text.trim()) { setError('Rubric cannot be empty'); return }
    setLoading(true); setError('')
    try {
      await api.post(`/features/${id}/rubric`, { dimensions_text: text })
      navigate(`/features/${id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save rubric')
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
        <h1 className="text-xl font-bold text-zinc-100">Rubric</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Define how to grade any output the same way twice. Be specific about what <strong className="text-zinc-300">pass</strong> means on each dimension.
        </p>
      </div>

      <Card>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Textarea
            label="Grading criteria"
            placeholder={PLACEHOLDER}
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ minHeight: 200 }}
          />
          {error && <Alert>{error}</Alert>}
          <div className="flex gap-3 mt-1">
            <Button variant="primary" loading={loading}>Save rubric</Button>
            <Link to={`/features/${id}`}><Button variant="ghost" type="button">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

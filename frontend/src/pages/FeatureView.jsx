import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { Card, Button, Badge, Empty, Spinner, Alert } from '../components/ui'

export default function FeatureView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get(`/features/${id}`).then(r => setData(r.data))
  }, [id])

  if (!data) return <div className="flex justify-center pt-20"><Spinner size={24} /></div>

  const { feature, cases, rubric, runs } = data
  const canRun = cases.length >= 5 && rubric

  return (
    <div>
      <Link to="/features" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-6">← All features</Link>

      {/* Header */}
      <Card className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{feature.name}</h1>
            <p className="text-zinc-500 text-sm mt-1">{feature.description || 'No description.'}</p>
          </div>
          {canRun
            ? <Button variant="run" onClick={() => navigate(`/features/${id}/run`)}>▶ Run Eval</Button>
            : <span className="text-xs text-zinc-600 pt-1">Need 5 cases + rubric to run</span>
          }
        </div>
        {runs.length > 0 && (
          <div className="flex gap-8 mt-5 pt-5 border-t border-zinc-800">
            <Stat value={cases.length} label="Golden cases" />
            <Stat value={runs.length} label="Runs" />
          </div>
        )}
      </Card>

      {/* Golden Cases */}
      <Card className="mb-4" padding={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">
            Golden Cases <span className="text-zinc-500 font-normal">({cases.length})</span>
          </h2>
          <Link to={`/features/${id}/cases/new`}><Button variant="secondary" size="sm">+ Add Case</Button></Link>
        </div>
        {cases.length === 0 ? (
          <Empty icon="📝" title="No cases yet — add at least 5 before running an eval." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left px-5 py-2.5 text-xs text-zinc-500 w-8">#</th>
                <th className="text-left px-5 py-2.5 text-xs text-zinc-500">Input</th>
                <th className="text-left px-5 py-2.5 text-xs text-zinc-500">Expected Output</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => (
                <tr key={c.id} className={i < cases.length - 1 ? 'border-b border-zinc-800/40' : ''}>
                  <td className="px-5 py-3 text-zinc-600 text-xs">{i + 1}</td>
                  <td className="px-5 py-3 text-zinc-300 text-xs whitespace-pre-wrap max-w-xs">{c.input}</td>
                  <td className="px-5 py-3 text-zinc-300 text-xs whitespace-pre-wrap max-w-xs">{c.expected_output}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Rubric */}
      <Card className="mb-4" padding={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Rubric</h2>
          <Link to={`/features/${id}/rubric`}><Button variant="secondary" size="sm">{rubric ? 'Edit' : '+ Add Rubric'}</Button></Link>
        </div>
        {rubric ? (
          <pre className="px-5 py-4 text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">{rubric.dimensions_text}</pre>
        ) : (
          <Empty icon="📏" title="No rubric yet — define grading criteria before running." />
        )}
      </Card>

      {/* Runs */}
      <Card padding={false}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Run History</h2>
        </div>
        {runs.length === 0 ? (
          <Empty icon="🚀" title="No runs yet. Add cases and a rubric, then hit Run Eval." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left px-5 py-2.5 text-xs text-zinc-500">Run</th>
                <th className="text-left px-5 py-2.5 text-xs text-zinc-500">Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {runs.map((r, i) => (
                <tr key={r.id} className={i < runs.length - 1 ? 'border-b border-zinc-800/40' : ''}>
                  <td className="px-5 py-3">
                    <Badge variant="neutral">Run #{runs.length - i}</Badge>
                  </td>
                  <td className="px-5 py-3 text-zinc-500 text-xs">{r.created_at?.slice(0, 16)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/runs/${r.id}`}><Button variant="ghost" size="sm">View results →</Button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-2xl font-bold text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

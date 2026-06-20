import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api'
import { Card, Badge, Spinner } from '../components/ui'

export default function RunResults() {
  const { runId } = useParams()
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get(`/runs/${runId}`).then(r => setData(r.data))
  }, [runId])

  if (!data) return <div className="flex justify-center pt-20"><Spinner size={24} /></div>

  const { run, feature, grades, summary } = data
  const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0

  return (
    <div>
      <Link to={`/features/${feature.id}`} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-6">
        ← Back to {feature.name}
      </Link>

      {/* Summary */}
      <Card className="mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Run Results</h1>
            <p className="text-zinc-500 text-sm mt-1">{feature.name} · {run.created_at?.slice(0, 16)}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${passRate === 100 ? 'text-emerald-400' : passRate >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {passRate}%
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">{summary.passed}/{summary.total} passed</div>
          </div>
        </div>

        <div className="flex gap-6 mt-5 pt-5 border-t border-zinc-800">
          <Stat value={summary.passed} label="Passed" color="text-emerald-400" />
          <Stat value={summary.failed} label="Failed" color="text-red-400" />
          <Stat value={summary.total} label="Total cases" color="text-zinc-300" />
        </div>
      </Card>

      {/* Grade per case */}
      <div className="flex flex-col gap-3">
        {grades.map((g, i) => (
          <Card key={g.id} className={`border-l-2 ${g.verdict === 'pass' ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-zinc-600 w-4">#{i + 1}</span>
                <Badge variant={g.verdict === 'pass' ? 'pass' : 'fail'}>
                  {g.verdict === 'pass' ? '✓ pass' : '✗ fail'}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-zinc-500 uppercase tracking-wider mb-1">Input</div>
                    <div className="text-zinc-300 whitespace-pre-wrap">{g.input}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 uppercase tracking-wider mb-1">Expected output</div>
                    <div className="text-zinc-300 whitespace-pre-wrap">{g.expected_output}</div>
                  </div>
                </div>
                {g.reasoning && (
                  <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-500">
                    <span className="text-zinc-600 uppercase tracking-wider">Reasoning · </span>
                    {g.reasoning}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Stat({ value, label, color }) {
  return (
    <div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

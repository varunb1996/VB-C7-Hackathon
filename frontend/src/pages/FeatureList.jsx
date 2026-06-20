import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { Card, Button, Empty, Spinner } from '../components/ui'

export default function FeatureList() {
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/features').then(r => setFeatures(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center pt-20"><Spinner size={24} /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">My Features</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Each feature is an AI capability you want to evaluate.</p>
        </div>
        <Link to="/features/new"><Button variant="primary">+ New Feature</Button></Link>
      </div>

      {features.length === 0 ? (
        <Card>
          <Empty icon="🎯" title="No features yet. Create your first one to start evaluating."
            action={<Link to="/features/new"><Button variant="primary">+ New Feature</Button></Link>} />
        </Card>
      ) : (
        <Card padding={false}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Feature</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={f.id} className={`hover:bg-zinc-800/40 transition-colors ${i < features.length - 1 ? 'border-b border-zinc-800/60' : ''}`}>
                  <td className="px-5 py-4 font-medium text-zinc-100">{f.name}</td>
                  <td className="px-5 py-4 text-zinc-400 max-w-xs truncate">{f.description || '—'}</td>
                  <td className="px-5 py-4 text-zinc-600 text-xs">{f.created_at?.slice(0, 10)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link to={`/features/${f.id}`}><Button variant="ghost" size="sm">Open →</Button></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

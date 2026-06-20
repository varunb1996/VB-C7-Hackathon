import { Link } from 'react-router-dom'
import { Card, Button } from '../components/ui'

export default function Home({ user }) {
  return (
    <div>
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="inline-flex items-center gap-2 bg-violet-950/50 border border-violet-800/50 rounded-full px-3 py-1 text-xs text-violet-300 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Eval Co-pilot
        </div>
        <h1 className="text-4xl font-bold text-zinc-100 leading-tight tracking-tight">
          Your AI feature is<br />probably wrong.
        </h1>
        <p className="text-zinc-400 text-base mt-4 leading-relaxed">
          Build a golden set. Write a rubric. Run the eval.<br />
          See exactly which cases fail — before you ship.
        </p>
        <div className="mt-8">
          <Link to="/features">
            <Button variant="primary" size="lg">Go to my features →</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
        {[
          { n: '①', title: 'Golden Set', desc: '5 inputs where you already know what a good output looks like — written before the model runs.' },
          { n: '②', title: 'Rubric',     desc: 'The rule that turns "is this good?" into something you can apply the same way twice.' },
          { n: '③', title: 'Run & Grade', desc: 'See the exact cases that fail. Not "it ran fine" — the actual failures you were about to ship.' },
        ].map(({ n, title, desc }) => (
          <Card key={title} className="text-center">
            <div className="text-2xl mb-3 text-zinc-500">{n}</div>
            <h2 className="text-sm font-semibold text-zinc-100 mb-2">{title}</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

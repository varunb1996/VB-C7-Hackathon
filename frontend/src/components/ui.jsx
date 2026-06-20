// Shared primitive components

export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all cursor-pointer border disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' }
  const variants = {
    primary:   'bg-violet-600 hover:bg-violet-500 text-white border-transparent',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700',
    ghost:     'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border-zinc-800',
    danger:    'bg-red-950/50 hover:bg-red-900/60 text-red-400 border-red-900/50',
    run:       'bg-violet-950/60 hover:bg-violet-900/60 text-violet-300 border-violet-800/50',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={loading} {...props}>
      {loading && <Spinner size={14} />}
      {children}
    </button>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>}
      <input
        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>}
      <textarea
        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-y min-h-[90px]"
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Badge({ children, variant = 'neutral' }) {
  const variants = {
    pass:    'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60',
    fail:    'bg-red-950/60 text-red-400 border border-red-900/60',
    neutral: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}

export function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin text-current">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

export function Alert({ children, variant = 'error' }) {
  const variants = {
    error: 'bg-red-950/40 border-red-900/60 text-red-400',
    info:  'bg-violet-950/40 border-violet-900/60 text-violet-300',
  }
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${variants[variant]}`}>
      {children}
    </div>
  )
}

export function Empty({ icon = '📭', title, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-zinc-500 text-sm">{title}</p>
      {action}
    </div>
  )
}

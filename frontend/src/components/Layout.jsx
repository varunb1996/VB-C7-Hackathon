import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api'

export default function Layout({ user, children }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function logout() {
    await api.get('/logout')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-13 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-2 h-2 rounded-full bg-violet-500 group-hover:bg-violet-400 transition-colors" />
            <span className="font-semibold text-sm text-zinc-100">Eval Co-pilot</span>
          </Link>

          <div className="flex items-center gap-1">
            {user && (
              <>
                <NavLink to="/features" active={location.pathname.startsWith('/features')}>Features</NavLink>
                <span className="text-xs text-zinc-600 px-2">{user.email}</span>
                <button
                  onClick={logout}
                  className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link to="/register" className="ml-1 px-3 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
        active
          ? 'text-zinc-100 bg-zinc-800'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
      }`}
    >
      {children}
    </Link>
  )
}

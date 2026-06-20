import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import api from './api'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import FeatureList from './pages/FeatureList'
import FeatureNew from './pages/FeatureNew'
import FeatureView from './pages/FeatureView'
import CaseNew from './pages/CaseNew'
import RubricEdit from './pages/RubricEdit'
import RunResults from './pages/RunResults'
import RunNew from './pages/RunNew'
import { Spinner } from './components/ui'

export default function App() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    api.get('/me').then(r => setUser(r.data)).catch(() => setUser(null))
  }, [])

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <Spinner size={28} />
      </div>
    )
  }

  function RequireAuth({ children }) {
    return user ? children : <Navigate to="/login" replace />
  }

  return (
    <BrowserRouter>
      <Layout user={user}>
        <Routes>
          <Route path="/login"        element={<Login onLogin={setUser} />} />
          <Route path="/register"     element={<Register onLogin={setUser} />} />
          <Route path="/"             element={<Navigate to="/features" replace />} />
          <Route path="/features"     element={<RequireAuth><FeatureList /></RequireAuth>} />
          <Route path="/features/new" element={<RequireAuth><FeatureNew /></RequireAuth>} />
          <Route path="/features/:id"             element={<RequireAuth><FeatureView /></RequireAuth>} />
          <Route path="/features/:id/cases/new"  element={<RequireAuth><CaseNew /></RequireAuth>} />
          <Route path="/features/:id/rubric"     element={<RequireAuth><RubricEdit /></RequireAuth>} />
          <Route path="/features/:id/run"         element={<RequireAuth><RunNew /></RequireAuth>} />
          <Route path="/runs/:runId"             element={<RequireAuth><RunResults /></RequireAuth>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

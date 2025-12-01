import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Competitions from './pages/Competitions'
import CompetitionDetails from './pages/CompetitionDetails'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import HabitDetails from './pages/HabitDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import { useAuthStore } from './stores/auth'
import NewHabit from './pages/NewHabit'   // ← добавили

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthed = useAuthStore(s => !!s.token)
  return isAuthed ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
  <Route path="/competitions" element={<Competitions />} />
  <Route path="/competitions/:id" element={<CompetitionDetails />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/habit/:id" element={<HabitDetails />} />
        <Route path="/habit/new" element={<NewHabit />} />   {/* ← вот это важно */}
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

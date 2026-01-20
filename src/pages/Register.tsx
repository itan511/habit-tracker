
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { Link, useNavigate } from 'react-router-dom'

export default function Register(){
  const [username, setU] = useState('')
  const [password, setP] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const register = useAuthStore(s=>s.register)
  const navigate = useNavigate()

  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await register({username, password, email})
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="card p-6 w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Регистрация</h1>

        {error && (
          <div className="text-red-400 text-sm">
            {error}
          </div>
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          className="bg-white/5 px-3 py-2 rounded-xl w-full"
          disabled={loading}
        />
        <input
          placeholder="Логин"
          value={username}
          onChange={e=>setU(e.target.value)}
          className="bg-white/5 px-3 py-2 rounded-xl w-full"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e=>setP(e.target.value)}
          className="bg-white/5 px-3 py-2 rounded-xl w-full"
          disabled={loading}
        />
        <button
          className="w-full bg-brand hover:bg-brand-dark rounded-xl py-2 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Создать'}
        </button>
        <div className="text-sm text-white/60">Есть аккаунт? <Link to="/login" className="text-white">Войти</Link></div>
      </form>
    </div>
  )
}

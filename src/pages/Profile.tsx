
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { authApi } from '@/services/authApi'
import type { User } from '@/services/authApi'

export default function Profile(){
  const { id } = useParams()
  const [user, setUser] = useState<User|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    loadUser()
  },[id])

  async function loadUser() {
    try {
      setLoading(true)
      const userData = await authApi.getMe()
      setUser(userData)
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки профиля')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Профиль</h1>
        <div className="card p-6 text-center">Загрузка...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Профиль</h1>
        <div className="card p-6 text-center text-red-400">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Профиль</h1>
      <div className="card p-6">
        <div className="text-xl">{user?.username}</div>
        <div className="text-[var(--muted)]">@{user?.username}</div>
        <div className="text-[var(--muted)]">{user?.email}</div>
      </div>
    </div>
  )
}

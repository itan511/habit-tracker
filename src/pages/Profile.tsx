
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/mocks/api'
import type { User } from '@/mocks/types'

export default function Profile(){
  const { id } = useParams()
  const [user, setUser] = useState<User|null>(null)
  useEffect(()=>{ api.getMe().then(setUser) },[id])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Профиль</h1>
      <div className="card p-6">
        <div className="text-xl">{user?.username}</div>
        <div className="text-[var(--muted)]">@{user?.username}</div>
      </div>
    </div>
  )
}

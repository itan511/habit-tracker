import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/mocks/api'
import { useCompetitionStore } from '@/stores/competitions'

export default function Competitions(){
  const [friends, setFriends] = useState<any[]>([])
  const [name, setName] = useState('')
  const [habitName, setHabitName] = useState('')
  const [desc, setDesc] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const { competitions, fetch, create } = useCompetitionStore()

  useEffect(()=>{ fetch(); api.getFriends().then(setFriends) },[])

  async function onCreate(e: any){
    e.preventDefault()
    if(!name || !habitName) return
    await create({ name, description: desc, memberIds: selected, habitName })
    setName(''); setDesc(''); setHabitName(''); setSelected([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Соревнования</h1>
      </div>

      <form onSubmit={onCreate} className="card p-4 grid gap-3">
        <div className="flex gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Название соревнования" className="flex-1 px-3 py-2 rounded-lg bg-white/5" />
          <input value={habitName} onChange={e=>setHabitName(e.target.value)} placeholder="Название привычки для соревнования" className="flex-1 px-3 py-2 rounded-lg bg-white/5" />
        </div>
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Описание (опционально)" className="w-full px-3 py-2 rounded-lg bg-white/5" />

        <div>
          <div className="text-sm text-[var(--muted)] mb-2">Пригласить друзей</div>
          <div className="grid grid-cols-2 gap-2">
            {friends.map(f=> (
              <label key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/2">
                <input type="checkbox" checked={selected.includes(f.id)} onChange={(e)=>{
                  setSelected(s => e.target.checked ? [...s, f.id] : s.filter(x=>x!==f.id))
                }} />
                <div>{f.name}</div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="submit" className="px-3 py-2 rounded-lg bg-blue-600 text-white">Создать соревнование</button>
        </div>
      </form>

      <div className="space-y-3">
        {competitions.length === 0 && <div className="text-[var(--muted)]">Пока нет соревнований — создайте своё.</div>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map(c => (
            <Link key={c.id} to={`/competitions/${c.id}`} className="card p-4 block hover:shadow-lg hover:-translate-y-1 transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{c.name}</div>
                  <div className="text-sm text-[var(--muted)]">{c.description}</div>
                </div>
                <div className="text-xl">🏆</div>
              </div>
              <div className="mt-3 text-sm text-[var(--muted)]">Участники:</div>
              <div className="mt-2 flex gap-2 flex-wrap">
                {c.members.map(m=> (
                  <div key={m.id} className="px-2 py-1 bg-white/5 rounded-lg">{m.name}</div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

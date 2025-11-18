
import { useEffect, useState } from 'react'
import { api } from '@/mocks/api'
import type { Habit } from '@/mocks/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Analytics(){
  const [habits, setHabits] = useState<Habit[]>([])
  useEffect(()=>{ api.getHabits().then(setHabits) },[])
  const selected = habits[0]
  const data = selected?.history.map(h=>({date:h.date, value: h.done ? 1 : 0}))
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Аналитика</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <div className="mb-2">Динамика выбранной привычки ({selected?.name})</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" hide />
                <YAxis domain={[0,1]} hide />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#60a5fa" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-[var(--muted)]">Сводка</div>
          <ul className="mt-2 space-y-1">
            {habits.map(h => (
              <li key={h.id} className="flex justify-between border-b border-white/5 py-2">
                <span>{h.name}</span>
                <span className="text-white/70">Streak {h.stats.streak} · {h.stats.completion_rate}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

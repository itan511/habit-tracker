import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCompetitionStore } from '@/stores/competitions'
import { api } from '@/mocks/api'
import ProgressRing from '@/components/ProgressRing'

export default function CompetitionDetails() {
  const { id } = useParams()
  const compId = Number(id)
  const { competitions, fetch } = useCompetitionStore()
  const [habit, setHabit] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch()
    api.getHabits().then(habits => {
      setHabit(habits.find(h => h.competitionId === compId))
      setLoading(false)
    })
  }, [compId])

  const comp = competitions.find(c => c.id === compId)
  if (!comp) return <div className="p-8">Соревнование не найдено</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/competitions" className="text-[var(--muted)] hover:underline">← Назад</Link>
        <h1 className="text-2xl font-bold">{comp.name}</h1>
      </div>
      <div className="text-[var(--muted)]">{comp.description}</div>
      <div className="mt-2 text-sm">Создатель: <span className="font-semibold">{comp.owner.name}</span></div>
      <div className="mt-4">
        <div className="font-semibold mb-2">Участники:</div>
        <div className="flex gap-2 flex-wrap">
          {comp.members.map(m => (
            <div key={m.id} className="px-3 py-1 rounded-lg bg-white/5 text-sm">{m.name}</div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <div className="font-semibold mb-2">Привычка соревнования:</div>
        {loading ? <div>Загрузка...</div> : habit ? (
          <div className="card p-4 flex items-center gap-6">
            <div>
              <div className="text-lg font-semibold">{habit.name}</div>
              <div className="text-sm text-[var(--muted)]">{habit.description}</div>
            </div>
            <ProgressRing progress={habit.stats.completion_rate} />
          </div>
        ) : <div className="text-[var(--muted)]">Нет привычки для этого соревнования</div>}
      </div>
      <div className="mt-6">
        <div className="font-semibold mb-2">Прогресс участников (мок):</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comp.members.map(m => (
            <div key={m.id} className="card p-4 flex items-center gap-4">
              <div className="font-semibold">{m.name}</div>
              <ProgressRing progress={habit ? habit.stats.completion_rate - Math.floor(Math.random()*20) : 0} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

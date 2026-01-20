
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { habitsApi } from '@/services/habitsApi'
import { format } from 'date-fns'

export default function HabitDetails(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [habit, setHabit] = useState<import('@/services/habitsApi').Habit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    if (!id) return
    loadHabit(Number(id))
  },[id])

  async function loadHabit(habitId: number) {
    try {
      setLoading(true)
      const data = await habitsApi.getById(habitId)
      setHabit(data)
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки привычки')
    } finally {
      setLoading(false)
    }
  }

  const toggleToday = async () => {
    if (!id || !habit) return
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      // Проверяем, что history существует и является массивом
      const history = habit.history || []
      const current = history.find(x=>x.date===today)?.done ?? false
      await habitsApi.updateProgress(Number(id), today, !current)
      loadHabit(Number(id)) // Перезагружаем привычку
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления прогресса')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Загрузка...</h1>
        <div className="card p-4 text-center">Загрузка деталей привычки...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Ошибка</h1>
        <div className="card p-4 text-center text-red-400">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl"
        >
          Назад
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{habit?.name}</h1>
        <button
          onClick={toggleToday}
          className="bg-brand hover:bg-brand-dark px-4 py-2 rounded-xl"
        >
          Отметить сегодня
        </button>
      </div>
      <div className="card p-4">
        <div className="text-sm text-[var(--text-muted)] mb-2">История</div>
        <div className="grid grid-cols-7 gap-2">
          {(habit?.history || []).slice(-28).map(h => (
            <div
              key={h.date}
              className={`h-8 rounded-lg ${(h.done ? 'bg-green-500/70' : 'bg-white/10 dark:bg-white/10')}`}
              title={`${h.date}: ${h.done ? 'Выполнено' : 'Не выполнено'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

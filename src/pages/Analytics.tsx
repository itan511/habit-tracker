
import { useEffect, useState } from 'react'
import { useHabitStore } from '@/stores/habits'
import type { Habit } from '@/mocks/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Analytics(){
  const { habits, fetch } = useHabitStore()
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null)

  useEffect(() => {
    fetch()
  }, [fetch])

  const selectedHabit = habits.find(h => h.id === selectedHabitId) || habits[0]
  const data = selectedHabit?.history.map(h => ({date: h.date, value: h.done ? 1 : 0}))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Аналитика</h1>

      <div className="card p-4">
        <div className="mb-4">
          <label htmlFor="habit-select" className="block text-sm font-medium mb-2">
            Выберите привычку для просмотра аналитики:
          </label>
          <select
            id="habit-select"
            value={selectedHabitId || ''}
            onChange={(e) => setSelectedHabitId(e.target.value ? Number(e.target.value) : null)}
            className="bg-white/5 px-3 py-2 rounded-xl w-full max-w-md"
          >
            <option value="">Выберите привычку</option>
            {habits.map(habit => (
              <option key={habit.id} value={habit.id}>
                {habit.name}
              </option>
            ))}
          </select>
        </div>

        {selectedHabit && (
          <div className="space-y-4">
            <div className="text-lg font-medium">
              Аналитика привычки: {selectedHabit.name}
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0,1]} tickFormatter={(value) => value === 1 ? 'Выполнено' : 'Не выполнено'} />
                  <Tooltip
                    formatter={(value) => [value === 1 ? 'Выполнено' : 'Не выполнено', 'Статус']}
                    labelFormatter={(value) => `Дата: ${value}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="card p-4">
        <div className="text-sm text-[var(--muted)] mb-3">Все ваши привычки</div>
        <ul className="space-y-2">
          {habits.map(h => (
            <li
              key={h.id}
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-colors ${
                selectedHabitId === h.id
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : 'border border-white/10 hover:bg-white/5'
              }`}
              onClick={() => setSelectedHabitId(h.id)}
            >
              <span className="font-medium">{h.name}</span>
              <div className="text-right">
                <div className="text-sm">Streak: {h.stats.streak} дн.</div>
                <div className="text-xs text-white/70">Выполнено: {h.stats.completion_rate}%</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

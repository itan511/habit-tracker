
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { friendsApi } from '@/services/friendsApi';
import { Habit } from '@/services/habitsApi';
import HabitCard from '@/components/HabitCard';

// Функция для вычисления средней серии
function calculateAverageStreak(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  const totalStreak = habits.reduce((sum, habit) => sum + habit.stats.streak, 0);
  return Math.round(totalStreak / habits.length);
}

// Функция для вычисления общего количества выполненных задач
function calculateTotalCompleted(habits: Habit[]): number {
  return habits.reduce((sum, habit) => {
    // Проверяем, что history существует и является массивом
    const history = habit.history || [];
    return sum + history.filter(entry => entry.done).length;
  }, 0);
}

// Функция для вычисления среднего процента выполнения
function calculateAverageCompletionRate(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  const validHabits = habits.filter(habit => habit.stats && typeof habit.stats.completion_rate === 'number');
  if (validHabits.length === 0) return 0;

  const totalRate = validHabits.reduce((sum, habit) => sum + habit.stats.completion_rate, 0);
  return totalRate / validHabits.length;
}

export default function FriendProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const [user, setUser] = useState<import('@/services/friendsApi').User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  // Статистика теперь вычисляется на фронтенде, не нужна отдельная переменная состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Проверяем, что userId - это действительное число
        if (isNaN(userId) || userId <= 0) {
          setError('Некорректный ID пользователя');
          return;
        }

        // Получаем информацию о пользователе
        const friends = await friendsApi.getAll();
        const foundUser = friends.find(f => f.id === userId);
        setUser(foundUser || null);

        // Получаем привычки пользователя
        if (foundUser) {
          const userHabits = await friendsApi.getFriendHabits(userId);
          // Убедимся, что userHabits - это массив
          const habitsData = Array.isArray(userHabits) ? userHabits : [];
          setHabits(habitsData);
        } else {
          setError('Пользователь не найден');
        }
      } catch (error) {
        console.error('Error fetching friend data:', error);
        setError('Ошибка при загрузке данных пользователя');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Профиль друга</h1>
        <div className="card p-6 text-center">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Профиль друга</h1>
        <div className="card p-6 text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Профиль друга</h1>
        <div className="card p-6 text-center">Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Профиль друга</h1>

      {/* Информация о пользователе */}
      <div className="card p-6">
        <div className="text-xl font-semibold">{user.username}</div>
        <div className="text-[var(--text-muted)]">@{user.username}</div>
        <div className="text-[var(--text-muted)] mt-2">{user.email}</div>
      </div>

      {/* Статистика друга (вычисляется на фронтенде) */}
      {habits.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Статистика привычек</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <div className="text-2xl font-bold">{habits.length}</div>
              <div className="text-sm text-[var(--text-muted)]">Привычки</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <div className="text-2xl font-bold">{calculateAverageStreak(habits)}</div>
              <div className="text-sm text-[var(--text-muted)]">Средняя серия</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <div className="text-2xl font-bold">{calculateTotalCompleted(habits)}</div>
              <div className="text-sm text-[var(--text-muted)]">Выполнено</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-xl">
              <div className="text-2xl font-bold">{calculateAverageCompletionRate(habits).toFixed(1)}%</div>
              <div className="text-sm text-[var(--text-muted)]">Сред. выполнение</div>
            </div>
          </div>
        </div>
      )}

      {/* Привычки пользователя */}
      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-4">Привычки пользователя</h2>
        {habits.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map(habit => (
              <div key={habit.id} className="space-y-2">
                <HabitCard habit={habit} showToggleBtn={false} />
                <div className="text-xs text-[var(--text-muted)]">
                  Серия: {habit.stats.streak} дней • Выполнение: {habit.stats.completion_rate.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-muted)]">
            У пользователя пока нет привычек
          </div>
        )}
      </div>
    </div>
  );
}
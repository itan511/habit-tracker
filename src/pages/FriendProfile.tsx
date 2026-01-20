
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/mocks/api';
import type { User, Habit } from '@/mocks/types';
import HabitCard from '@/components/HabitCard';

export default function FriendProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем информацию о пользователе
        // В реальности нам нужно будет получить пользователя по ID
        // Пока получаем список друзей и ищем нужного
        const friends = await api.getFriends();
        const foundUser = friends.find(f => f.id === userId);
        setUser(foundUser || null);

        // Получаем привычки пользователя
        if (foundUser) {
          const userHabits = await api.getUserHabits(userId);
          setHabits(userHabits);
        }
      } catch (error) {
        console.error('Error fetching friend data:', error);
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
      <div className="card p-6">
        <div className="text-xl">{user.username}</div>
        <div className="text-[var(--muted)]">@{user.username}</div>
        <div className="text-[var(--muted)] mt-2">{user.email}</div>
      </div>

      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-4">Привычки пользователя</h2>
        {habits.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map(habit => (
              <div key={habit.id} className="space-y-2">
                <HabitCard habit={habit} showToggleBtn={false} />
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
import { useEffect, useState } from "react";
import { api } from "@/mocks/api";
import type { User, Habit } from "@/mocks/types";
import HabitCard from "@/components/HabitCard";

export default function Friends() {
  const [friends, setFriends] = useState<User[]>([]);
  const [friendHabits, setFriendHabits] = useState<Record<number, Habit[]>>({});
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // грузим моковых друзей
    api.getFriends().then(setFriends);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!tag.trim()) return;

    const newFriend = await api.addFriend(tag.trim());
    setFriends([...friends, newFriend]);
    setTag("");
  }

  const loadFriendHabits = async (userId: number) => {
    if (friendHabits[userId]) {
      // Если привычки уже загружены, просто переключаемся на этого друга
      setSelectedFriendId(userId);
      return;
    }

    // Устанавливаем состояние загрузки
    setLoading(prev => ({ ...prev, [userId]: true }));

    try {
      const habits = await api.getUserHabits(userId);
      setFriendHabits(prev => ({ ...prev, [userId]: habits }));
      setSelectedFriendId(userId);
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const selectedFriend = friends.find(f => f.id === selectedFriendId);
  const habitsForSelectedFriend = friendHabits[selectedFriendId || -1] || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        Друзья
      </h1>

      {/* Форма: на маленьких экранах в столбик, на больших — в ряд */}
      <form
        onSubmit={handleAdd}
        className="flex flex-col sm:flex-row gap-2 max-w-xl"
      >
        <input
          className="flex-1 rounded-2xl bg-slate-900/80 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="@username"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        <button
          type="submit"
          className="flex-shrink-0 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
        >
          Добавить
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Список друзей */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-3">Ваши друзья</h2>
          <div className="space-y-3">
            {friends.map((f) => (
              <div
                key={f.id}
                className={`rounded-3xl bg-[var(--card)] border border-[var(--card-accent)] px-4 py-3 cursor-pointer transition-all ${
                  selectedFriendId === f.id
                    ? 'ring-2 ring-blue-500/50'
                    : 'hover:bg-[var(--card-hover)]'
                }`}
                onClick={() => loadFriendHabits(f.id)}
              >
                <div className="font-semibold text-[var(--text)]">{f.username}</div>
                <div className="text-sm text-[var(--text-muted)]">@{f.username}</div>
              </div>
            ))}
            {friends.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">
                Пока нет друзей. Добавьте кого-нибудь по @тегу.
              </p>
            )}
          </div>
        </div>

        {/* Привычки выбранного друга */}
        <div className="lg:col-span-2">
          {selectedFriend ? (
            <div className="space-y-4">
              <div className="card p-4">
                <h2 className="text-xl font-semibold">Привычки {selectedFriend.username}</h2>
                <p className="text-[var(--text-muted)]">@{selectedFriend.username}</p>
              </div>

              {loading[selectedFriend.id] ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  Загрузка привычек...
                </div>
              ) : (
                <div>
                  {habitsForSelectedFriend.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {habitsForSelectedFriend.map(h => (
                        <div key={h.id} className="space-y-2">
                          <HabitCard habit={h} />
                          {/* Кнопка "Переключить сегодня" скрыта для чужих привычек */}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card p-6 text-center text-[var(--text-muted)]">
                      У этого пользователя пока нет привычек
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card p-6 text-center text-[var(--text-muted)]">
              Выберите друга из списка, чтобы посмотреть его привычки
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

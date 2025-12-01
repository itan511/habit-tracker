import { useEffect, useState } from "react";
import { api } from "../mocks/api";

interface Friend {
  id: number;
  name: string;
  username: string;
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [tag, setTag] = useState("");

  useEffect(() => {
    // грузим моковых друзей
    api.getFriends().then((data: any) => setFriends(data));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!tag.trim()) return;

    const updated = await api.addFriend(tag.trim());
    setFriends(updated as any);
    setTag("");
  }

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

      {/* Список друзей — ограничиваем ширину, чтобы не вылезало за экран */}
      <div className="space-y-3 max-w-xl">
        {friends.map((f) => (
          <div
            key={f.id}
            className="rounded-3xl bg-[var(--card)] border border-[var(--card-accent)] px-4 py-3"
          >
            <div className="font-semibold text-[var(--text)]">{f.name}</div>
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
  );
}

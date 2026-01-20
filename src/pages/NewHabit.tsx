import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { habitsApi } from "@/services/habitsApi";

export default function NewHabit() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name?.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await habitsApi.create({ name, description });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ошибка при создании привычки");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        Новая привычка
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl bg-[var(--card)] border border-[var(--card-accent)] p-4 sm:p-6"
      >
        {error && (
          <div className="text-red-400 text-sm p-2 bg-red-900/30 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-[var(--text-muted)]">Название</label>
          <input
            className="w-full rounded-2xl bg-[var(--card-accent)] border border-[var(--card-accent)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
            placeholder="Например, Утренний бег"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-[var(--text-muted)]">Описание</label>
          <textarea
            className="w-full rounded-2xl bg-[var(--card-accent)] border border-[var(--card-accent)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none h-24 disabled:opacity-50"
            placeholder="Коротко, что именно ты делаешь"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-[var(--text-muted)]">Периодичность</label>
          <select
            className="w-full rounded-2xl bg-[var(--card-accent)] border border-[var(--card-accent)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)] disabled:opacity-50"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={loading}
          >
            <option value="daily">Каждый день</option>
            <option value="weekly">Несколько раз в неделю</option>
            <option value="custom">По расписанию</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-2xl border border-[var(--card-accent)] text-sm text-[var(--text-muted)] hover:bg-[var(--card-accent)] disabled:opacity-50"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-accent)] text-sm font-semibold text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Создание..." : "Создать"}
          </button>
        </div>
      </form>
    </div>
  );
}

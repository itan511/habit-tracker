
# Habit Tracker — Frontend (Vite + React + TS + Tailwind)

Полностью готовый каркас фронта с продуманной навигацией, страницами и моками API.
Соответствует брифу: доска привычек, аналитика, профиль, друзья, отдельная страница привычки, логин/регистрация.
Маршруты защищены, JWT хранится в localStorage (мок).

## Стек
- React 18 + Vite + TypeScript
- TailwindCSS (тёмная тема по умолчанию)
- React Router v6
- Zustand (простое состояние)
- Recharts (графики аналитики)
- Моки API (`src/mocks/api.ts`) — легко заменить на реальный бекенд /api/v1/*

## Запуск
```bash
npm i
npm run dev
```

## Структура
- `src/components` — Layout, карточки, прогресс‑кольцо
- `src/pages` — Dashboard, Analytics, Friends, Profile, HabitDetails, Login, Register
- `src/stores` — auth + habits
- `src/mocks` — types, data, api

## Подключение к реальному бэку
Замените реализации в `src/mocks/api.ts` на вызовы `fetch('/api/v1/...')`.
Контракты уже соответствуют примеру JSON из брифа.

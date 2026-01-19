// Конфигурационный файл для настройки URL бэкенда

export const API_CONFIG = {
  // Базовый URL вашего Go-сервера
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',

  // Таймаут для запросов (в миллисекундах)
  TIMEOUT: 10000,

  // Параметры для разработки
  DEV: {
    ENABLE_MOCK_DELAY: false, // Включить задержки для имитации реального API
    MOCK_DELAY_MIN: 300,
    MOCK_DELAY_MAX: 800,
  }
};
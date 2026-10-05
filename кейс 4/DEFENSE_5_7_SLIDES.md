# Презентация для защиты — 6 слайдов

## 1. Задача и результат
Сервис заявок доведён до эксплуатационной версии: auth, роли, Docker, Nginx, Grafana, health, logs, tests, Swagger.

## 2. Архитектура
Nginx → Node.js API → PostgreSQL; Grafana читает данные мониторинга из PostgreSQL.

## 3. Безопасность
bcrypt, JWT 15 минут, refresh HttpOnly cookie, rate limit login, 401/403, роли viewer/technician/admin.

## 4. Эксплуатация
health/live, health/ready, requestId, JSON logs, graceful shutdown, `.env.example`, Docker healthchecks.

## 5. Мониторинг и тесты
Grafana dashboard, 5xx alert, Jest unit/integration checks, Swagger/Postman.

## 6. Демонстрация
Login → create request → assign team → in_progress → done → Grafana. Затем показать диагностику PostgreSQL через health/logs.
